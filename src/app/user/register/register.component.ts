import { Component } from '@angular/core';
import {
  UntypedFormControl, UntypedFormGroup, Validators
} from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { EmailTaken } from '../validators/email-taken';
import { RegisterValidators } from '../validators/register-validators';
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  inSubmission = false;
  constructor(
    private authService: AuthService,
    private emailTaken: EmailTaken
  ) {}
  name = new UntypedFormControl('', [
    Validators.required,
    Validators.minLength(3),
  ]);
  email = new UntypedFormControl(
    '',
    [Validators.required, Validators.email],
    [this.emailTaken.validate]
  );
  age = new UntypedFormControl('', [
    Validators.required,
    Validators.min(18),
    Validators.max(120),
  ]);
  password = new UntypedFormControl('', [
    Validators.required,
    Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm),
  ]);
  confirm_password = new UntypedFormControl('', [Validators.required]);
  phoneNumber = new UntypedFormControl('', [
    Validators.required,
    Validators.minLength(13),
    Validators.maxLength(13),
  ]);
  showAlert = false;
  alertMsg = 'Please wait! Your account is being created.';
  alertColor = 'blue';

  registerForm = new UntypedFormGroup(
    {
      name: this.name,
      email: this.email,
      age: this.age,
      password: this.password,
      confirm_password: this.confirm_password,
      phoneNumber: this.phoneNumber,
    },
    [RegisterValidators.match('password', 'confirm_password')]
  );

  async register() {
    this.showAlert = true;
    this.alertMsg = 'Please wait! Your account is being created.';
    this.alertColor = 'blue';
    this.inSubmission = true;

    const { email, password } = this.registerForm.value;
    try {
      this.authService.createUser({
        name: this.name.value,
        email: this.email.value,
        age: this.age.value,
        phoneNumber: this.phoneNumber.value,
        password: this.password.value,
      });
      this.alertMsg = 'Your account has been created';
      this.alertColor = 'green';
      this.inSubmission = false;
    } catch (error) {
      console.log(error);
      this.alertMsg = 'An unexpected error occured. Please try again later';
      this.alertColor = 'red';
      this.inSubmission = false;
      return;
    }
  }
}
