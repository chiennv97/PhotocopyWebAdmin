import { Component, OnInit } from '@angular/core';
import { UserService } from '../core/user.service';
import { AuthService } from '../core/auth.service';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirebaseUserModel } from '../core/user.model';
import { AngularFireDatabase, AngularFireObject, AngularFireList } from '@angular/fire/database';
import { Observable } from 'rxjs';
import {UserIdService} from '../core/userId.service';
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
import { finalize } from 'rxjs/operators';
import * as ImageEditor from 'tui-image-editor';
import Swal from 'sweetalert2';
import {Router} from '@angular/router';

@Component({
  selector: 'page-user',
  templateUrl: 'order.component.html',
  styleUrls: ['order.css']
})
export class OrderComponent {

  user: FirebaseUserModel = new FirebaseUserModel();
  profileForm: FormGroup;
  numberOfPrint = 1;
  file;
  name = '';
  page;
  price = 100;
  customerName = '';
  numberPhone = '';
  address = '';
  customers: AngularFireObject<any>;
  currentUser: Observable<any>;
  users$: AngularFireList<any>;
  orders$: AngularFireList<any>;
  event;
  imageData;
  blackTheme = {
    'common.bi.image': 'assets/img/editor-logo.png',
    'common.bisize.width': '190px',
    'common.backgroundImage': 'none',
    'common.backgroundColor': '#1e1e1e',
    'common.border': '0px',

    // header
    'header.backgroundImage': 'none',
    'header.backgroundColor': 'transparent',
    'header.border': '0px',

    // load button
    'loadButton.backgroundColor': '#fff',
    'loadButton.border': '1px solid #ddd',
    'loadButton.color': '#222',
    'loadButton.fontFamily': '\'Noto Sans\', sans-serif',
    'loadButton.fontSize': '12px',

    // download button
    'downloadButton.backgroundColor': '#fdba3b',
    'downloadButton.border': '1px solid #fdba3b',
    'downloadButton.color': '#fff',
    'downloadButton.fontFamily': '\'Noto Sans\', sans-serif',
    'downloadButton.fontSize': '12px',

    // main icons
    'menu.normalIcon.path': '../css/svg/icon-d.svg',
    'menu.normalIcon.name': 'icon-d',
    'menu.activeIcon.path': '../css/svg/icon-b.svg',
    'menu.activeIcon.name': 'icon-b',
    'menu.disabledIcon.path': '../css/svg/icon-a.svg',
    'menu.disabledIcon.name': 'icon-a',
    'menu.hoverIcon.path': '../css/svg/icon-c.svg',
    'menu.hoverIcon.name': 'icon-c',
    'menu.iconSize.width': '24px',
    'menu.iconSize.height': '24px',

    // submenu primary color
    'submenu.backgroundColor': '#1e1e1e',
    'submenu.partition.color': '#3c3c3c',

    // submenu icons
    'submenu.normalIcon.path': '../css/svg/icon-d.svg',
    'submenu.normalIcon.name': 'icon-d',
    'submenu.activeIcon.path': '../css/svg/icon-c.svg',
    'submenu.activeIcon.name': 'icon-c',
    'submenu.iconSize.width': '32px',
    'submenu.iconSize.height': '32px',

    // submenu labels
    'submenu.normalLabel.color': '#8a8a8a',
    'submenu.normalLabel.fontWeight': 'lighter',
    'submenu.activeLabel.color': '#fff',
    'submenu.activeLabel.fontWeight': 'lighter',

    // checkbox style
    'checkbox.border': '0px',
    'checkbox.backgroundColor': '#fff',

    // range style
    'range.pointer.color': '#fff',
    'range.bar.color': '#666',
    'range.subbar.color': '#d1d1d1',

    'range.disabledPointer.color': '#414141',
    'range.disabledBar.color': '#282828',
    'range.disabledSubbar.color': '#414141',

    'range.value.color': '#fff',
    'range.value.fontWeight': 'lighter',
    'range.value.fontSize': '11px',
    'range.value.border': '1px solid #353535',
    'range.value.backgroundColor': '#151515',
    'range.title.color': '#fff',
    'range.title.fontWeight': 'lighter',

    // colorpicker style
    'colorpicker.button.border': '1px solid #1e1e1e',
    'colorpicker.title.color': '#fff'
  };

  task: AngularFireUploadTask;
  taskCover: AngularFireUploadTask;

  // Progress monitoring
  percentage: Observable<number>;
  percentageCover: Observable<number>;

  snapshot: Observable<any>;
  snapshotCover: Observable<any>;

  // Download URL
  downloadURL: Observable<string>;
  downloadURLCover: Observable<string>;

  // State for dropzone CSS toggling
  isHovering: boolean;
  display = true;
  done = 0;

  constructor(
    public userService: UserService,
    public authService: AuthService,
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder,
    public db: AngularFireDatabase,
    public userIdService: UserIdService,
    private storage: AngularFireStorage,
    private router: Router,
  ) {
    this.userService.getCurrentUser()
      .then(res => {
        if (res.providerData[0].providerId === 'password') {
          this.user.image = 'http://dsi-vd.github.io/patternlab-vd/images/fpo_avatar.png';
          this.user.name = res.displayName;
          this.user.provider = res.providerData[0].providerId;
        } else {
          // console.log(order);
          this.user.image = res.photoURL;
          this.user.name = res.displayName;
          this.user.provider = res.providerData[0].providerId;
        }
      }, err => {
        // this.router.navigate(['/login']);
      });
    console.log(this.getUserId());
    this.customers = this.db.object('users/' + this.getUserId());
    this.customers.snapshotChanges().subscribe(action => {
      console.log(action.payload.val());
      this.customerName = action.payload.val().customerName;
      this.numberPhone = action.payload.val().numberPhone;
      this.address = action.payload.val().address;
    });
    this.users$ = this.db.list('/users');
    this.orders$ = this.db.list('/orders/' + this.getUserId());
    // this.currentUser = this.customers.object('lCot8XRm2jNCYchutulTYL7ANIq2').valueChanges();

  }
  onSubmit(formFile) {
    console.log(formFile);
  }
  logNumberOfPrint() {
    console.log(this.numberOfPrint);
  }
  chooseFile(event) {
    console.log(event);
    this.event = event;
    this.name = event.target.files[0].name;
    console.log(this.user);
    const reader = new FileReader();
    reader.readAsBinaryString(event.target.files[0]);
    // comment when run
    // const seft = this;
    // reader.onloadend = function() {
    //   const count = reader.result.match(/\/Type[\s]*\/Page[^s]/g).length;
    //   seft.page = count;
    // };
    // this.startUpload(event.target.files);
  }
  createForm(name) {
    this.profileForm = this.fb.group({
      name: [name, Validators.required ]
    });
  }

  save(value) {
    this.userService.updateCurrentUser(value)
    .then(res => {
      console.log(res);
    }, err => console.log(err));
  }

  logout() {
    this.authService.doLogout()
    .then((res) => {
      this.location.back();
    }, (error) => {
      console.log('Logout error', error);
    });
  }
  updateCustomerAddress() {
    this.customers.update({
      customerName: this.customerName,
      numberPhone: this.numberPhone,
      address: this.address
    });
    // this.users$.remove(this.userIdService.getUserId());
    // this.authService.updateCustomerAddress(this.userIdService.getUserId(), this.customerName, this.numberPhone, this.address);
  }

  toggleHover(event: boolean) {
    this.isHovering = event;
  }


  startUpload(event: FileList) {
    // The File object
    const file = event.item(0);
    console.log(file);

    // The storage path
    const path = `test/${new Date().getTime()}_${file.name}`;

    // Totally optional metadata
    const customMetadata = { app: 'My AngularFire-powered PWA!' };

    // The main task
    this.task = this.storage.upload(path, file, { customMetadata });
    const fileRef = this.storage.ref(path);

    // Progress monitoring
    this.percentage = this.task.percentageChanges();
    this.snapshot   = this.task.snapshotChanges();

    // The file's download URL
    // this.downloadURL = this.task.downloadURL();
    this.task.snapshotChanges().pipe(
      finalize(() => {
        const timeCreate = new Date().getTime();
        fileRef.getDownloadURL().subscribe(url => {
          this.done++;
          this.downloadURL = url;
          if (this.done === 2) {
            this.orders$.update(timeCreate.toString(), {
              name: this.name,
              numberOfPrint: this.numberOfPrint,
              page: this.page,
              docurl: url,
              coverurl: this.downloadURLCover,
              price: this.price,
              timeUpload: timeCreate,
              timeFinish: '',
              customerName: this.customerName,
              numberPhone: this.numberPhone,
              address: this.address,
              status: 'wait'
            });
            console.log('cap nhat thanh cong');
            Swal({
              type: 'success',
              title: 'Waiting',
              text: 'Waiting some seconds',
              timer: 2000,
            });
            this.router.navigate(['/history']);
          }
        });
      })
    )
      .subscribe();
  }

  startUploadCover(imageData) {
    // The File object
    // const file = event;

    // Client-side validation example
    // if (file.type.split('/')[0] !== 'image') {
    //   console.error('unsupported file type :( ')
    //   return;
    // }

    // The storage path
    const coverName = `${new Date().getTime()}`;

    // Totally optional metadata
    // const customMetadata = { format: 'base64' };

    // The main task
    // this.taskCover = this.storage.upload(path, file, { customMetadata });
    // console.log(imageData.substring(22));
    this.taskCover = this.storage.ref('cover').child(coverName)
      .putString(imageData.substring(22), 'base64');
    // this.storage.ref(`cover/${coverName}`).getDownloadURL().subscribe((imageUrl) => {
    //   console.log(imageUrl);
    // });
    const fileRef = this.storage.ref(`cover/${coverName}`);
    // this.storage.upload(path, imageData.substring(22), customMetadata);
    // Progress monitoring
    // this.percentageCover = this.taskCover.percentageChanges();
    // this.snapshotCover   = this.taskCover.snapshotChanges();

    // The file's download URL
    // this.downloadURL = this.task.downloadURL();
    this.taskCover.snapshotChanges().pipe(
      finalize(() => {
        fileRef.getDownloadURL().subscribe((coverUrl) => {
          const timeCreate = new Date().getTime();
          this.done++;
          this.downloadURLCover = coverUrl;
          if (this.done === 2) {
            this.orders$.update(timeCreate.toString(), {
              name: this.name,
              numberOfPrint: this.numberOfPrint,
              page: this.page,
              docurl: this.downloadURL,
              coverurl: this.downloadURLCover,
              price: this.price,
              timeUpload: timeCreate,
              timeFinish: '',
              customerName: this.customerName,
              numberPhone: this.numberPhone,
              address: this.address,
              status: 'wait'
            });
            console.log('cap nhat thanh cong');
            Swal({
              type: 'success',
              title: 'Đặt hàng thành công',
              text: 'success',
              timer: 2000,
            });
            this.router.navigate(['/history']);
          }
        });
      })
    )
      .subscribe();
  }
  // Determines if the upload task is active
  isActive(snapshot) {
    return snapshot.state === 'running' && snapshot.bytesTransferred < snapshot.totalBytes;
  }

  orderPrint() {
    this.done = 0;
    // swal('Click on either the button or outside the modal.')
    //   .then((value) => {
    //     swal(`The returned value is: ${value}`);
    //   });
    Swal({
      type: 'warning',
      title: 'Waiting',
      text: 'Waiting some seconds'
    });
    this.startUpload(this.event.target.files);
    this.startUploadCover(this.imageData);
    // console.log(this.getUserId());
  }
  getUserId() {
    return localStorage.getItem('currentUserID');
  }
  designCover() {
    this.display = false;
    localStorage.setItem('imageData', '');
    document.getElementById('tui-image-editor-container').style.display = 'block';
    const imageEditor = new ImageEditor('#tui-image-editor-container', {
      includeUI: {
        loadImage: {
          path: '../assets/img/background-default.jpg',
          name: 'SampleImage'
        },
        theme: this.blackTheme,
        initMenu: 'mask',
        menuBarPosition: 'left'
      },
      cssMaxWidth: 3000,
      cssMaxHeight: 3000
    });
    window.onresize = function() {
      imageEditor.ui.resizeEditor();
    };
    document.getElementById('ui-image-editor-download-btn').addEventListener('click', () => {
      console.log('da click');
      if (!this.display) {
        document.getElementById('tui-image-editor-container').style.display = 'none';
        this.display = true;
        this.sleep(1000).then(() => {
          this.imageData = localStorage.getItem('imageData');
          // console.log(localStorage.getItem('imageBlob'));
        });
      }
    });
  }
  sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }
}
