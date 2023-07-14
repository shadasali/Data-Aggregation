import React, {useState} from 'react';

function ResetPassword () {
    const [password, setPassword] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
    const [confirmPassword, setConfirmPassword] = useState('');
    const [invalidConfirmation, setInvalidConfirmation] = useState(false);

    const handlePassword = (e) =>{
        setPassword(e.target.value);
    }

    const handleConfirmPassword = (e) =>{
        setConfirmPassword(e.target.value);
    }

    const validateInputs = () => {
        const errors = {};
      
        // Check each input field for empty values
        if (password.trim() === '') {
          errors.password = 'New password is required';
        }
        
        if(confirmPassword.trim() === ''){
            errors.confirmPassword = 'Confirm password is required'
        }

        // Update the validation errors state
        setValidationErrors(errors);
      
        // Return true if there are no validation errors
        return Object.keys(errors).length === 0;
    };

    const handleResetPassword = () =>{
        const isValid = validateInputs();
        if (isValid){
            if (password === confirmPassword){
                
            }
            else{
                setInvalidConfirmation(true);
            }
        }
        else{

        }
    };

    return(
        <div className="background">
            <div className="container">
                <div className="ResetPassword border border-primary rounded p-3">
                    <h2>Reset Password</h2>
                    <br></br>
                    <div className="forgot-password-container"></div>
                        <div className='reset-password-section'>
                            <label htmlFor='password' className='Password'>
                                <input type = "text" placeholder="Password" value={password} onChange={handlePassword} className={validationErrors.password ? 'input-error' : ''} style={{width:'400px', paddingRight: '2.5rem'}} />
                                {validationErrors.password && <div className="error-message">{validationErrors.password}</div>}
                            </label>
                        </div>
                        <div className="forgot-password-section"> 
                            <label htmlFor='password' className='Password'>
                                <input type = "text" placeholder="Confirm Password" value={confirmPassword} onChange={handleConfirmPassword} className={validationErrors.password ? 'input-error' : ''} style={{width:'400px', paddingRight: '2.5rem'}} />
                                {validationErrors.confirmPassword && <div className="error-message">{validationErrors.confirmPassword}</div>}
                                {invalidConfirmation && <div className="error-message">Passwords must match</div>}
                            </label>
                        </div>
                    </div>
                    <div className="d-flex justify-content-center">
                        <button className="btn btn-primary rounded-button" 
                            type="button" 
                            onClick={handleResetPassword} 
                            style={{ width: '400px', borderRadius: '25px', paddingLeft: '20px', paddingRight: '20px' }}>
                            Submit
                        </button>
                        <span/>
                    </div>
                </div>
            </div>
    );
}

export default ResetPassword;