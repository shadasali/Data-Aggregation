import React, {useState} from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import './newUser.css'
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import app from './firebase';
import { getAuth, signInWithPopup, GoogleAuthProvider, fetchSignInMethodsForEmail} from 'firebase/auth';
import {isEmail} from 'validator';

function NewUser() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(true);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
    const [hasErrors, setHasErrors] = useState(false);
    const [invalidEmail, setInvalidEmail] = useState(false);
    const [emailExists, setEmailExists] = useState(false);

    const navigate = useNavigate();
    
    const handleLastName = (e) =>{
        setLastName(e.target.value);
    }

    const handleFirstName = (e) =>{
        setFirstName(e.target.value);
    }

    const handleEmail = (e) =>{
        setEmail(e.target.value);
    }

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const validateInputs = () => {
        const errors = {};
      
        // Check each input field for empty values
        if (firstName.trim() === '') {
          errors.firstName = 'First Name is required';
        }
        if (lastName.trim() === '') {
          errors.lastName = 'Last Name is required';
        }
        if (email.trim() === '') {
          errors.email = 'Email is required';
        }
        if (password.trim() === '') {
          errors.password = 'Password is required';
        }
      
        // Update the validation errors state
        setValidationErrors(errors);
      
        // Return true if there are no validation errors
        return Object.keys(errors).length === 0;
      };

    const handleNewUser = async () =>{
        const isValid = validateInputs();

        if (isValid){
            try{
                if (!isEmail(email)) {
                    setInvalidEmail(true);
                    return;
                }
                const fullName = `${firstName} ${lastName}`;
                const auth = getAuth();

                const signInMethods = await fetchSignInMethodsForEmail(auth, email);

                if (signInMethods.length > 0) {
                    setHasErrors(true);
                    setEmailExists(true); 
                    return;
                }

                const response = await axios.post(`http://localhost:8000/createUser?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&fullname=${encodeURIComponent(fullName)}`);
  
                if (response.data.success === false){
                    setHasErrors(true);
                    setInvalidEmail(true);
                }
                else{
                    navigate("/");
                }

            } catch(error){
                console.log('Error creating new user:', error);
            }
        }
        else{
            setHasErrors(true);
            return;
        }
    };

    const handleGoogleAuth = async (response) => {
        try {
          const { tokenId } = response;
        
          const provider = new GoogleAuthProvider();

          provider.setCustomParameters({
            id_token: tokenId
          });
        
          const auth = getAuth(app);
          const result = await signInWithPopup(auth, provider);

          const { user, credential } = result;
        
          navigate('/home');
        } catch (error) {
          console.error('Error authenticating with Firebase:', error);
        }
    };      

    const errorCount = Object.keys(validationErrors).length;
    const heightIncrease = (errorCount + hasErrors) * 20;

    return(
        <div className="background">
        <div className="container">
            <div className={`NewUser ${hasErrors ? 'error' : ''} border border-primary rounded p-3`} style={{ '--height-increase': `${heightIncrease}px` }}>
                <h2>Create Account:</h2>
                <div className = "signIn-section d-flex justify-content-center">
                <Link to="/" className="newUser" style={{textDecoration:'none'}}>
                    <span className="gray-text">Already have an account?</span> Login! 
                </Link>
                </div>
                <br></br>
                <div className="newUser-container">
                <div className="newUser-section">
                    <label htmlFor='FirstName' className='FirstName'>
                        <input type = "text" placeholder="First Name" value={firstName} onChange={handleFirstName} className={validationErrors.firstName ? 'input-error' : ''} style={{width:'300px', paddingRight: '2.5rem'}}/>
                        {validationErrors.firstName && <div className="error-message">{validationErrors.firstName}</div>}
                    </label>
                </div>
                <div className="newUser-section">
                    <label htmlFor='LastName' className='LastName'>
                        <input type = "text" placeholder="Last Name" value={lastName} onChange={handleLastName} className={validationErrors.lastName ? 'input-error' : ''} style={{width:'300px', paddingRight: '2.5rem'}}></input>
                        {validationErrors.lastName && <div className="error-message">{validationErrors.lastName}</div>}
                    </label>
                </div>
                <div className="newUser-section">
                    <label htmlFor='Email' className='Email'>
                        <input type = "text" placeholder="Email" value={email} onChange={handleEmail} className={validationErrors.email ? 'input-error' : ''} style={{width:'300px', paddingRight: '2.5rem'}}></input>
                        {validationErrors.email && <div className="error-message">{validationErrors.email}</div>}
                        {invalidEmail && <div className="error-message">Please enter a valid email</div>}
                        {emailExists && <div className="error-message">This email already exists, {' '}  
                            <Link to="/" className="emailExists" style={{textDecoration:'none'}}>
                                login!
                            </Link>
                        </div>}
                        
                    </label>
                </div>
                <div className='newUser-section'>
                    <label htmlFor='Password' className='passWord'>
                    <div className="password-input-container">
                        <input type={showPassword ? 'password' : 'text'} placeholder="Password" value = {password} onChange={handlePasswordChange} className={validationErrors.password ? 'input-error' : ''} style={{width:'300px'}}></input>
                        {showPassword ? (
                            <FaEyeSlash className="password-icon" onClick={togglePasswordVisibility} />
                            ) : (
                            <FaEye className="password-icon" onClick={togglePasswordVisibility} />
                        )}
                    </div>
                    {validationErrors.password && <div className="error-message">{validationErrors.password}</div>}
                    </label>
                </div>
            </div>
            <div className="d-flex justify-content-center">
                <button className="btn btn-primary rounded-button" 
                type="button" 
                onClick={handleNewUser} 
                style={{ width: '300px', borderRadius: '25px', paddingLeft: '20px', paddingRight: '20px' }}>
                Sign up
                </button>
                <span/>
            </div>
            
            <div className="line-section">
                <hr className="horizontal-line" />
                <span className="or-text">OR</span>
                <hr className="horizontal-line" />
            </div>
            
            <div className="google-sign-in d-flex justify-content-center">
                <button className="google-button" type="button" onClick={handleGoogleAuth}style={{ width: '300px' }}>
                    <span className="google-icon"><i className="google-icon"></i></span>
                    <span className="google-text">Continue with Google</span>
                </button>
            </div>

            </div>
        </div>
        </div>
    );
}

export default NewUser;