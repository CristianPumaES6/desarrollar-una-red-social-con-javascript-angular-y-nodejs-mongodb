import { Component, OnInit } from '@angular/core';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service'

@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    providers: [UserService]
})

export class LoginComponent implements OnInit {
    public title: string;
    public user:User;

    constructor(
        private _userService:UserService
    ) {
        this.title = 'Identificate';
        this.user = new User("","","","","","","ROLE_USER","");
    }

    ngOnInit() {
        console.log('Componente de login cargado..')
    }

    onSubmit(){
        console.log("Enviar datos")
    }
}