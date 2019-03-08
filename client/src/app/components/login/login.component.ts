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
    public user: User;
    public status: string;
    public identity;
    public token;

    constructor(
        private _userService: UserService
    ) {
        this.title = 'Identificate';
        this.user = new User("", "", "", "", "", "", "ROLE_USER", "");
    }

    ngOnInit() {
        console.log('Componente de login cargado..')
    }

    onSubmit() {
        //logear al usuario y consegir sus datos.
        this._userService.singup(this.user).subscribe(
            response => {
                this.identity = response.user;

                console.log(this.identity);

                if (!this.identity || !this.identity._id) {
                    this.status = 'error';
                } else {
                    this.status = 'success';
                    // PERSISTIR DATOS DEL USUARIO
                    localStorage.setItem('identity', JSON.stringify(this.identity));

                    //Conseguir el token
                    this.getToken();
                }
            }, error => {
                var errorMessage = <any>error;
                console.log(errorMessage);

                if (errorMessage != null) {
                    this.status = 'error';
                }
            }
        )
    }

    getToken() {
        //logear al usuario y consegir sus datos.
        this._userService.singup(this.user, 'true').subscribe(
            response => {
                this.token = response.token;
                console.log(this.token);

                if (this.token.length <= 0) {
                    this.status = 'error';
                } else {
                    this.status = 'success';
                    // PERSISTIR TOKEN DEL USUARIO
                    localStorage.setItem('token', JSON.stringify(this.token));

                    //Conseguir el contadores o estadisticas de usuario.

                    this.getToken();
                }
            }, error => {
                var errorMessage = <any>error;
                console.log(errorMessage);

                if (errorMessage != null) {
                    this.status = 'error';
                }
            }
        )
    }
}