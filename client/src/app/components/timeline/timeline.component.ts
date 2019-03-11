import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { Publication } from '../../models/publication';
import { GLOBAL } from '../../services/global';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css']
})
export class TimelineComponent implements OnInit {

  private title: string;
  public identity;
  public token;
  public status: string;
  public url: string;

  constructor(
    private _route: ActivatedRoute,
    private _routers: Router,
    private _userService: UserService
    ) { 
      this.title = 'Timeline';
      this.identity =this._userService.getIdentity();
      this.token = this._userService.getToken();
      this.url = GLOBAL.url;
    }

  ngOnInit() {
    console.log("TimelineComponent.components cargados")
  }

}
