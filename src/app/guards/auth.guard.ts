import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const router = inject(Router);

  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  // If no token, redirect to login
  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  // Check if route requires a specific role
  const requiredRole = route.data['role'];

  // If no role restriction, allow access
  if (!requiredRole) {
    return true;
  }

  // If roles don't match, block access
  if (userRole !== requiredRole) {
    router.navigate(['/login']);
    return false;
  }
  return true;
};
