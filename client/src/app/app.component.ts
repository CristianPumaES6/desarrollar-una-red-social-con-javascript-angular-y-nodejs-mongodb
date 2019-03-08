import { Component, OnInit, DoCheck } from '@angular/core';
import { UserService } from './services/user.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [UserService]
})

export class AppComponent implements OnInit, DoCheck {
  public title: string;
  public identity;

  constructor(
    private _userService: UserService
  ) {
    this.title = 'CPSocial';
  }

  ngOnInit() {
    this.identity = this._userService.getIdentity();
    console.log(this.identity);
  }
  //cada vez que haiga un cambio se ejecuta el DoCheck
  ngDoCheck() {
    this.identity = this._userService.getIdentity();
  }
}
