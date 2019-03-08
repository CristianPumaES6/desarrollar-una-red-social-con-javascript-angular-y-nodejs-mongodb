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

  onSubmit() {
    this._userService.register(this.user);
  }
}
