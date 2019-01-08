import { Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { OrderComponent } from './order/order.component';
import { RegisterComponent } from './register/register.component';
import { UserResolver } from './order/user.resolver';
import { AuthGuard } from './core/auth.guard';
import {HomeComponent} from './home/home.component';
import {HistoryOrderComponent} from './history-order/history-order.component';

export const rootRouterConfig: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent},
  { path: 'login', component: LoginComponent, canActivate: [AuthGuard] },
  // { path: 'register', component: RegisterComponent, canActivate: [AuthGuard] },
  { path: 'history', component: OrderComponent},
  { path: 'order', component: HistoryOrderComponent}
];
