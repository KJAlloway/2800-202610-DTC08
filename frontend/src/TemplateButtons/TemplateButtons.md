-- Below is an example of how you can access the template buttons:

import Button from './TemplateButtons/Button';

If you wanna edit anything further you'll have to do your own CSS to 
make it look proper and in-line with how the wireframes were supposed 
to look.

-- Here is a code snippet of how it would function in your HTML file:

<div class="login-actions">
    <button type="button" class="general-button">
        <span class="button-content">
            Sign Up/Register
        </span>
    </button>

    <button type="submit" class="general-button">
        <span class="button-content">
            Login
        </span>
    </button>
</div>

<button type="button" class="general-button guest-button"> (You can add multiple classes if u need to add more css changes for the width of the buttons, etc.)
    <span class="button-content">
        Continue without an account
    </span>
</button>