import React, { useState } from 'react';
import axios from 'axios';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';

const TracuuForm = () => {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [name, setName] = useState(""); 
  const [errorMess, setErrorMess] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMess('');
    setResult(null); 

    if (!executeRecaptcha) {
      setErrorMess('ReCAPTCHA has not been loaded');
      setLoading(false);
      return;
    }

    try {
      // Get the reCAPTCHA v3 token
      const recaptchaToken = await executeRecaptcha('submit');

      // Make API request with reCAPTCHA token
      const response = await axios.post('https://dtn-event-api.toiyeuptit.com/api/retrieve', {
        username: name,
        s: "null", 
        with_trashed: true,
        only_trashed: true,
        per_page: "10",
        page: 0,
        "g-recaptcha-response": recaptchaToken,
      }, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      setResult(response.data); 
      console.log('API Response:', response.data);
      
    } catch (err) {
      setErrorMess('An error occurred while fetching data. Please try again.');
      console.error('API Error:', err);
    } finally {
      setLoading(false); 
      setName(""); 
    }
  };

  return (
    <div className="lookup-container">
      <h1>Lookup Information</h1>
      <form onSubmit={handleSubmit}>
        {errorMess && <p className="error-message">{errorMess}</p>} 
        <div>
          <label htmlFor="name">Enter your username:</label>
          <input
            type="text"
            id="name"
            placeholder="Enter your name"
            name="name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <input
            type="submit"
            value="Send"
            disabled={loading} 
          />
        </div>
      </form>

      {result && (
        <div className="result-section">
          <h2>Results</h2>
          <pre>{JSON.stringify(result, null, 2)}</pre> 
        </div>
      )}
    </div>
  );
};

const Tracuu = () => {
  return (
    <GoogleReCaptchaProvider reCaptchaKey="6LdGg1kqAAAAACjQRHCtqK71x9-NjCW4qAFCgssh">
      <TracuuForm />
    </GoogleReCaptchaProvider>
  );
};

export default Tracuu;
