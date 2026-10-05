import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class SecurityGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    const token = localStorage.getItem('smu_token');
    if (!token) {
      return this.router.parseUrl('/login');
    }

    const tienePreguntas = localStorage.getItem('smu_tiene_preguntas') === 'true';
    const debeCambiarClave = localStorage.getItem('smu_debe_cambiar_clave') === 'true';

    // If the user tries to go to any page other than /configurar-seguridad,
    // and they don't have questions or must change password, redirect them.
    if (!tienePreguntas || debeCambiarClave) {
      if (state.url !== '/configurar-seguridad') {
        return this.router.parseUrl('/configurar-seguridad');
      }
    } else {
      // If they are fine and try to go to configurar-seguridad, let them proceed (or redirect to dashboard)
      // Actually if they are fully setup they shouldn't go to /configurar-seguridad manually.
      if (state.url === '/configurar-seguridad') {
        return this.router.parseUrl('/dashboard');
      }
    }

    return true;
  }
}
