import { Component, OnInit } from '@angular/core';
import { User } from '../../models/user';

@Component({
  selector: 'register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  public title: string;
  public user: User;

  constructor() {
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
    console.log(this.user);
  }
}
