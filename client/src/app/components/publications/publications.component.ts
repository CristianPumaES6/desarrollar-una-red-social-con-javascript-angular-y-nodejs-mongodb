import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { Publication } from '../../models/publication';
import { GLOBAL } from '../../services/global';
import { UserService } from '../../services/user.service';
import { PublicationService } from '../../services/publication.service';
import * as $ from 'jquery';

@Component({
  selector: 'app-publications',
  templateUrl: './publications.component.html',
  styleUrls: ['./publications.component.css'],
  providers: [UserService, PublicationService]
})
export class PublicationsComponent implements OnInit {

  private title: string;
  public identity;
  public token;
  public status: string;
  public url: string;
  public page;
  public total;
  public pages;
  public itemsPerPag;
  private publications: Publication[];

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _userService: UserService,
    private _publicationService: PublicationService
  ) {
    this.title = 'Publicaciones';
    this.identity = this._userService.getIdentity();
    this.token = this._userService.getToken();
    this.url = GLOBAL.url;
    this.page = 1;
  }

  ngOnInit() {
    console.log("PublicationsComponent.components cargados");
    this.getPublications(this.page)
  }

  getPublications(page, adding = false) {
    this._publicationService.getPublications(this.token, page).subscribe(
      response => {
        if (response.publications) {
          this.pages = response.pages;
          this.total = response.total_items;
          this.status = 'success';
          this.itemsPerPag = response.items_per_page;

          if (!adding) {
            this.publications = response.publications;
          } else {
            var arrayA = this.publications;
            var arrayB = response.publications;
            this.publications = arrayA.concat(arrayB);

            $("html, body").animate({
              scrollTop: $('body').prop("scrollHeight")
            }, 500);
          }

          if (page > this.pages) {
            this._router.navigate(['/home'])
          }
        } else {
          this.status = 'error';
        }
        console.log(response);
      },
      error => {
        var errorMesasage = <any>error;
        console.log(errorMesasage);

        if (errorMesasage != null) {
          this.status = 'error';
        }
      }
    )
  }


  public noMore = false;
  viewMore() {
    this.page += 1;
    if (this.page == this.pages) {
      this.noMore = true;
    }
    this.getPublications(this.page, true);
  }
}

