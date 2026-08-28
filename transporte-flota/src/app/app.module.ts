import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './services/auth.interceptor';

import { AppComponent } from './app.component';
import { FlotaComponent } from './modules/flota/flota.component';
import { InspeccionComponent } from './modules/inspeccion/inspeccion.component';
import { ConductoresComponent } from './modules/conductores/conductores.component';
import { MantenimientoComponent } from './modules/mantenimiento/mantenimiento.component';
import { DocumentosComponent } from './modules/documentos/documentos.component';
import { FilterStatusPipe } from './shared/pipes/filter-status.pipe';
import { LoginComponent } from './modules/login/login.component';
import { AuditoriaComponent } from './modules/auditoria/auditoria.component';
import { OnlyNumbersDirective } from './shared/directives/only-numbers.directive';
import { AprobacionesComponent } from './modules/aprobaciones/aprobaciones.component';
import { PerfilComponent } from './modules/perfil/perfil.component';

@NgModule({
  declarations: [
    AppComponent,
    FlotaComponent,
    InspeccionComponent,
    ConductoresComponent,
    MantenimientoComponent,
    DocumentosComponent,
    FilterStatusPipe,
    LoginComponent,
    AuditoriaComponent,
    OnlyNumbersDirective,
    AprobacionesComponent,
    PerfilComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }