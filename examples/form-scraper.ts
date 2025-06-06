import {
  CrawleeScraperEngine,
  ScraperDefinition,
  createConfig,
  createLogger,
  ScraperContext,
} from '../src'; // Assuming 'src' is the root of compiled sources or use 'crawlee-scraper-toolkit'

// Define the structure of the data we are submitting
interface MyFormData {
  customerName: string;
  telephone: string;
  emailAddress: string;
  deliveryInstructions: string;
  pizzaSize: 'small' | 'medium' | 'large';
  toppings: string[];
}

// Define the expected structure of the JSON response from httpbin.org/forms/post
interface HttpbinFormResponse {
  args: Record<string, string>; // Query arguments (none in this POST example)
  data: string; // Raw data string, usually URL-encoded form data
  files: Record<string, string>; // Files, if any
  form: { // This is what we are interested in
    custname: string;
    custtel: string;
    custemail: string;
    size: string;
    topping: string[] | string; // httpbin might return single topping as string
    delivery: string;
    comments: string; // There's a comments field, let's submit it empty
  };
  headers: Record<string, string>;
  json: null; // Not a JSON post
  origin: string; // IP address
  url: string; // The URL hit
}

interface FormScraperOutput {
  submittedData: MyFormData;
  responseText: Partial<HttpbinFormResponse['form']>; // We'll extract the 'form' part
}

const formScraperDefinition: ScraperDefinition<MyFormData, FormScraperOutput> = {
  id: 'form-submit-scraper',
  name: 'Form Submission Scraper',
  description: 'Demonstrates filling and submitting a form on httpbin.org/forms/post',
  url: 'https://httpbin.org/forms/post',
  navigation: {
    type: 'direct',
    config: {},
  },
  waitStrategy: {
    type: 'load', // Wait for the initial form page to load
    config: { waitUntil: 'domcontentloaded' }
  },
  requiresCaptcha: false,
  parse: async (context: ScraperContext<MyFormData, FormScraperOutput>): Promise<FormScraperOutput> => {
    const { page, input: formData, log } = context;

    log.info('Navigated to form page:', { url: page.url() });

    // Fill out the form
    log.info('Filling form with data:', formData);
    await page.fill('input[name="custname"]', formData.customerName);
    await page.fill('input[name="custtel"]', formData.telephone);
    await page.fill('input[name="custemail"]', formData.emailAddress);

    // Handle radio button for size
    await page.check(`input[name="size"][value="${formData.pizzaSize}"]`);

    // Handle checkboxes for toppings
    for (const topping of formData.toppings) {
      await page.check(`input[name="topping"][value="${topping}"]`);
    }

    await page.fill('textarea[name="delivery"]', formData.deliveryInstructions);
    // The "comments" field is also present, we'll leave it empty or add a default.
    await page.fill('textarea[name="comments"]', 'No comments.');

    // Submit the form by clicking the first submit button
    // (httpbin form has multiple submit buttons, we'll click the main one)
    log.info('Submitting the form...');
    // await page.locator('input[type="submit"]').first().click(); // Alternative
    await page.click('button[type="submit"]'); // Assuming there is a button type submit

    // Wait for navigation/response after submission.
    // httpbin.org/post returns a JSON response directly on the page.
    // We need to wait for this response to load.
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    log.info('Form submitted, processing response page.');

    // Extract the JSON response content from the page
    // The response is usually within a <pre> tag or directly in the body as text.
    const responseText = await page.locator('pre').innerText(); // httpbin wraps JSON in <pre>
    let responseJson: HttpbinFormResponse;
    try {
      responseJson = JSON.parse(responseText);
      log.info('Successfully parsed JSON response from httpbin.');
    } catch (e: any) {
      log.error('Failed to parse JSON response from page content.', { error: e.message, responseText });
      throw new Error('Could not parse JSON response after form submission.');
    }

    // Verify submitted data (optional, but good for an example)
    const submittedForm = responseJson.form;
    log.info('Received form data in response:', submittedForm);

    // Note: httpbin may handle multiple toppings differently (e.g. only last one if same name)
    // For this example, we just map what we expect.
    return {
      submittedData: formData,
      responseText: {
        custname: submittedForm.custname,
        custtel: submittedForm.custtel,
        custemail: submittedForm.custemail,
        size: submittedForm.size,
        topping: Array.isArray(submittedForm.topping) ? submittedForm.topping : [submittedForm.topping],
        delivery: submittedForm.delivery,
      },
    };
  },
  options: {
    retries: 1, // Forms are usually not idempotent, so fewer retries
    timeout: 30000,
  },
};

// --- Main execution ---
const logger = createLogger({ level: 'info', format: 'text', console: true });

async function main() {
  const config = createConfig()
    .defaultOptions({ retries: 1, timeout: 35000 })
    .logging({ level: 'info', format: 'text' })
    .build();

  const engine = new CrawleeScraperEngine(config, logger);
  engine.register(formScraperDefinition);

  const formDataToSubmit: MyFormData = {
    customerName: 'John Doe',
    telephone: '123-456-7890',
    emailAddress: 'john.doe@example.com',
    pizzaSize: 'medium',
    toppings: ['bacon', 'cheese', 'onion'], // 'onion' is not a value on httpbin, 'mushroom' is
    deliveryInstructions: 'Leave at front door. Call upon arrival.',
  };
  // Correcting topping to a valid value from httpbin.org/forms/post
  formDataToSubmit.toppings = ['bacon', 'cheese', 'mushroom'];


  try {
    logger.info('🚀 Starting Form Scraper with data:', formDataToSubmit);
    const result = await engine.execute(formScraperDefinition, formDataToSubmit);

    if (result.success && result.data) {
      logger.info('✅ Form Scraper executed successfully:');
      logger.info('Submitted Data:', result.data.submittedData);
      logger.info('Response Form Data:', result.data.responseText);
      // You can add assertions here to check if responseText matches submittedData
      if (result.data.responseText.custname === formDataToSubmit.customerName) {
        logger.info('Customer name matches in response.');
      } else {
        logger.warn('Customer name does NOT match in response!');
      }
    } else {
      logger.error('❌ Form Scraper failed:', { message: result.error?.message });
    }
  } catch (error: any) {
    logger.error('💥 Unexpected error in main execution:', { message: error.message, stack: error.stack });
  } finally {
    await engine.shutdown();
    logger.info('🔚 Engine shutdown complete.');
  }
}

if (require.main === module) {
  main();
}

export { formScraperDefinition };
