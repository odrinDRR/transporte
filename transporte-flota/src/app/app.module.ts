import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { FlotaComponent } from './modules/flota/flota.component';
import { InspeccionComponent } from './modules/inspeccion/inspeccion.component';
import { ConductoresComponent } from './modules/conductores/conductores.component';
import { MantenimientoComponent } from './modules/mantenimiento/mantenimiento.component';
import { DocumentosComponent } from './modules/documentos/documentos.component';
import { CombustibleComponent } from './modules/combustible/combustible.component';
import { FilterStatusPipe } from './shared/pipes/filter-status.pipe';
import { LoginComponent } from './modules/login/login.component';
import { AuditoriaComponent } from './modules/auditoria/auditoria.component';

@NgModule({
  declarations: [
    AppComponent,
    FlotaComponent,
    InspeccionComponent,
    ConductoresComponent,
    MantenimientoComponent,
    DocumentosComponent,
    CombustibleComponent,
    FilterStatusPipe,
    LoginComponent,
    AuditoriaComponent
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }