import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseStorageService {
  constructor(private http: HttpClient) {}

  /**
   * Sube un archivo directamente a Supabase Storage usando su API REST
   */
  async uploadFile(file: File, bucket: string, folder: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${new Date().getTime()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;
    
    const url = `${environment.supabaseUrl}/storage/v1/object/${bucket}/${filePath}`;
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${environment.supabaseKey}`,
      'apikey': environment.supabaseKey,
      'Content-Type': file.type || 'application/octet-stream'
    });

    try {
      // Usamos el cliente HTTP nativo de Angular para evitar problemas con la librería externa
      await this.http.post(url, file, { headers }).toPromise();
      
      // Retorna la URL pública de la imagen guardada
      return `${environment.supabaseUrl}/storage/v1/object/public/${bucket}/${filePath}`;
    } catch (error) {
      console.error('Error subiendo archivo a Supabase Storage API:', error);
      throw error;
    }
  }
}
