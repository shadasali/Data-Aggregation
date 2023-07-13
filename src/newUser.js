import React, {useState} from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import './newUser.css'
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function NewUser() {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(true);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
    const [hasErrors, setHasErrors] = useState(false);
    const [invalidEmail, setInvalidEmail] = useState(false);
    const navigate = useNavigate();
    
    const handleLastName = (e) =>{
        setLastName(e.target.value);
    }

    const handleFirstName = (e) =>{
        setFirstName(e.target.value);
    }

    const handleUserName = (e) =>{
        setUserName(e.target.value);
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
        if (userName.trim() === '') {
          errors.userName = 'Username is required';
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
                const response = await axios.post(`http://localhost:8000/createUser?email=${encodeURIComponent(userName)}&password=${encodeURIComponent(password)}`);
  
                if (response.data.success === false){
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
    }

    const errorCount = Object.keys(validationErrors).length;
    const heightIncrease = errorCount * 18;

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
                    <label htmlFor='Username' className='userName'>
                        <input type = "text" placeholder="Email" value={userName} onChange={handleUserName} className={validationErrors.userName ? 'input-error' : ''} style={{width:'300px', paddingRight: '2.5rem'}}></input>
                        {validationErrors.userName && <div className="error-message">{validationErrors.userName}</div>}
                        {invalidEmail && <div className="error-message">Please enter a valid email</div>}
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
                <a href="/signin-google" className="google-button" style={{ width: '300px' }}>
                    <span className="google-icon"><i className="google-icon"></i></span>
                    <span className="google-text">Continue with Google</span>
                </a>
            </div>
            <div className="facebook-sign-in d-flex justify-content-center">
                <a href="/signin-facebook" className="facebook-button" style={{ width: '300px' }}>
                    <span className="facebook-icon"><i className="facebook-icon"></i></span>
                    <span className="facebook-text"> Continue with Facebook</span>
                </a>
            </div>

            </div>
        </div>
        </div>
    );
}

export default NewUser;