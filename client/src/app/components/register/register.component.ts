import { Component, OnInit } from '@angular/core';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service'

@Component({
  selector: 'register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  providers: [UserService]
})
export class RegisterComponent implements OnInit {
  public title: string;
  public user: User;
  public status: String;

  constructor(
    private _userService: UserService
  ) {
    this.title = 'Registrate';
    this.user = new User(
      "",
      "",
      "",
      "",
      "",
      "",
      "ROLE_USER",
      "");
  }

  ngOnInit() {
    console.log('Componente de Register cargado..');
  }

  onSubmit(form) {
    this._userService.register(this.user).subscribe(
      response => {
        if (response.user && response.user._id) {
          this.status = 'success';
          form.reset();
        } else {
          this.status = 'error';
        }
      }, error => {
        console.log(<any>error)
      }
    );
  }
}
