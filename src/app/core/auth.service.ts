import { Injectable } from '@angular/core';
import 'rxjs/add/operator/toPromise';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import {Observable} from 'rxjs/Observable';
import {switchMap} from 'rxjs/operators';
import {of} from 'rxjs/internal/observable/of';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import {UserIdService} from './userId.service';
import Swal from 'sweetalert2';

interface User {
  uid: string;
  email: string;
  photoURL?: string;
  displayName?: string;
  customerName?: string;
  numberPhone?: string;
  address?: string;
}

@Injectable()
export class AuthService {
  user: Observable<User>;
  users$: AngularFireList<any>;
  constructor(
    public afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private af: AngularFireDatabase,
    public userid: UserIdService
  ) {
    // this.order = this.afAuth.authState.pipe(
    //   switchMap(order => {
    //     if (order) {
    //       return this.afs.doc<User>(`users/${order.uid}`).valueChanges();
    //     } else {
    //       return of(null);
    //     }
    //   })
    // );
    // this.users$ = this.af.list('/users');
  }

  doFacebookLogin(){
    return new Promise<any>((resolve, reject) => {
      let provider = new firebase.auth.FacebookAuthProvider();
      this.afAuth.auth
        .signInWithPopup(provider)
        .then(res => {
          resolve(res);
        }, err => {
          console.log(err);
          reject(err);
        })
    })
  }
  doTwitterLogin(){
    return new Promise<any>((resolve, reject) => {
      let provider = new firebase.auth.TwitterAuthProvider();
      this.afAuth.auth
        .signInWithPopup(provider)
        .then(res => {
          resolve(res);
        }, err => {
          console.log(err);
          reject(err);
        })
    })
  }

  doGoogleLogin(){
    return new Promise<any>((resolve, reject) => {
      let provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      this.afAuth.auth
        .signInWithPopup(provider)
        .then(res => {
          // const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${res.order.uid}`);
          // userRef.set(data, { merge: true });
          this.users$ = this.af.list('/users');
          // this.users$.update(res.user.uid, data);
          if (res.user.uid !== 'lCot8XRm2jNCYchutulTYL7ANIq2') {
            Swal({
              type: 'error',
              title: 'Lỗi! Vui lòng thử lại',
              text: 'Bạn không có quyền admin của shop',
              timer: 3000,
            });
            reject(res);
          }
          this.users$.snapshotChanges()
            .subscribe(actions => {
              var didLogin = 0;
              actions.forEach(action => {
                console.log(action.key);
                if (action.key === res.user.uid) {
                  didLogin = 1;
                  console.log(didLogin);
                }
              });
              if (didLogin === 1) {
                const data: User = {
                  uid: res.user.uid,
                  email: res.user.email,
                  displayName: res.user.displayName,
                  photoURL: res.user.photoURL,
                };
                this.users$.update(res.user.uid, data);
              } else {
                const data: User = {
                  uid: res.user.uid,
                  email: res.user.email,
                  displayName: res.user.displayName,
                  photoURL: res.user.photoURL,
                  customerName: '',
                  numberPhone: '',
                  address: ''
                };
                this.users$.update(res.user.uid, data);
              }
            });
          this.userid.setUserId(res.user.uid);
          localStorage.setItem('currentUserID', res.user.uid);
          resolve(res);
        }, err => {
          console.log(err);
          reject(err);
        });
    });
  }

  doRegister(value){
    return new Promise<any>((resolve, reject) => {
      firebase.auth().createUserWithEmailAndPassword(value.email, value.password)
        .then(res => {
          resolve(res);
        }, err => reject(err))
    })
  }

  doLogin(value){
    return new Promise<any>((resolve, reject) => {
      firebase.auth().signInWithEmailAndPassword(value.email, value.password)
        .then(res => {
          resolve(res);
        }, err => reject(err));
    });
  }

  doLogout(){
    return new Promise((resolve, reject) => {
      if(firebase.auth().currentUser){
        this.afAuth.auth.signOut()
        resolve();
      }
      else{
        reject();
      }
    });
  }
  updateCustomerAddress(id, customerName, numberPhone, address) {
    this.users$ = this.af.list('/users');
    this.users$.update(id, {
      customerName: customerName,
      numberPhone: numberPhone,
      address: address
    });
  }
}
