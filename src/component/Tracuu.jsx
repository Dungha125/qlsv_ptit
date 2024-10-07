import React, { useState } from 'react';
import axios from 'axios';
import ReCAPTCHA from "react-google-recaptcha";

const Tracuu = () => {
  const reCaptchaKey = '6LdGg1kqAAAAACjQRHCtqK71x9-NjCW4qAFCgssh'; // Your reCAPTCHA site key
  const [name, setName] = useState(""); 
  const [capVal, setCapVal] = useState("");
  const [errorMess, setErrorMess] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // State to store the API response

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMess('');
    setResult(null); // Reset previous result

    if (!capVal) {
      setErrorMess('Please complete the CAPTCHA.');
      setLoading(false);
      return;
    }

    try {
      // Make API request here
      const response = await axios.post('http://dtn-event-api.toiyeuptit.com/api/retrieve', {
        username: name,
        s: "string", 
        with_trashed: true,
        only_trashed: true,
        per_page: "10",
        page: 0,
        "g-recaptcha-response": capVal,
      }, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      setResult(response.data); // Store the API response
      console.log('API Response:', response.data);
      
    } catch (err) {
      setErrorMess('An error occurred while fetching data. Please try again.');
      console.error('API Error:', err);
    } finally {
      setLoading(false); // Reset loading state
      setName(""); // Optionally reset form fields
      setCapVal(""); 
    }
  };

  return (
    <div className="lookup-container">
      <h1>Lookup Information</h1>
      <form onSubmit={handleSubmit}>
        {errorMess && <p className="error-message">{errorMess}</p>} {/* Show error message */}
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
        
        <ReCAPTCHA
          sitekey={reCaptchaKey}
          onChange={(val) => setCapVal(val)}
        />

        <div>
          <input
            type="submit"
            value="Send"
            disabled={!capVal || loading} // Disable if CAPTCHA is not completed or while loading
          />
        </div>
      </form>

      {/* Show result if available */}
      {result && (
        <div className="result-section">
          <h2>Results</h2>
          <pre>{JSON.stringify(result, null, 2)}</pre> {/* Displaying the result */}
        </div>
      )}
    </div>
  );
};

export default Tracuu;
