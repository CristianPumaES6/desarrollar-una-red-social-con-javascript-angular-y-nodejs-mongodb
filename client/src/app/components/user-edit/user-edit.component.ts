import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { GLOBAL } from '../../services/global';

import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
import { UploadService } from '../../services/upload.service';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css'],
  providers: [UserService, UploadService]
})
export class UserEditComponent implements OnInit {

  private title: string;
  public user: User;
  public identity;
  public token;
  public status: string;
  public filesToUpload: Array<File>;
  public url: string;

  constructor(
    private _route: ActivatedRoute,
    private _routers: Router,
    private _userService: UserService,
    private _uploadService: UploadService
  ) {
    this.title = 'Actualizar mis datos';
    this.user = this._userService.getIdentity();
    this.identity = this.user;
    this.token = this._userService.getToken();
    this.url = GLOBAL.url;
  }

  ngOnInit() {
    console.log(this.user);
    console.log("user.edith component se ha cargado.");
  }

  onSubmit() {
    console.log(this.user);
    this._userService.updateUser(this.user).subscribe(
      response => {
        if (!response.user) {
          this.status = "error";
        } else {
          this.status = "success";
          localStorage.setItem('identity', JSON.stringify(this.user));
          this.identity = this.user;

          //Subir Imagen del usuario
          this._uploadService.makeFileRequest(
            this.url + 'update-image-user/' + this.user._id, [],
            this.filesToUpload,
            this.token,
            'image').then((result: any) => {
              console.log(result);
              this.user.image = result.user.image;
              localStorage.setItem('identity', JSON.stringify(this.user));
            });


        }
      }, error => {
        var errorMessage = <any>error;
        console.log(errorMessage);

        if (errorMessage != null) {
          this.status = 'error';
        }
      }
    );
  }

  fileChangeEvent(fileInput: any) {
    this.filesToUpload = <Array<File>>fileInput.target.files;
    console.log(this.filesToUpload)
  }
}
