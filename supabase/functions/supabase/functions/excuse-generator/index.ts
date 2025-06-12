// This is a serverless function that receives a POST request and returns a random excuse.

export const fetchRandomCatImage = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.thecatapi.com/v1/images/search', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'omit',
    });

    const data = await response.json();

    if (Array.isArray(data) && data.length > 0 && data[0].url) {
      return data[0].url;
    } else {
      throw new Error('No image URL found in API response');
    }
  } catch (error) {
    console.error('Error fetching cat image:', error);
    throw error;
  }
};


/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/excuse-generator' \
    --header 'Authorization: Bearer KEY' \
    --header 'Content-Type: application/json' \
    --data '{"language": "en"}'

*/
