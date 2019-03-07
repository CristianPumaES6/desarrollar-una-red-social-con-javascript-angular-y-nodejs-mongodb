import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  public title: string;

  constructor() {
    this.title = 'Register';
  }

  ngOnInit() {
    console.log('Componente de Register cargado..');
  }

}
