import { Injectable, Injector } from '@angular/core';
import { FormsService } from '../../forms.service';

@Injectable({
  providedIn: 'root'
})
export class DbService {
  private db!: IDBDatabase;
  private formsConfig: any;
  private formsService!: FormsService;
  private dbInitialized = false;

  constructor(private injector: Injector) {
    setTimeout(() => {
      this.formsService = this.injector.get(FormsService);
      this.formsService.formsConfig$.subscribe(config => {
        if (config) {
          this.formsConfig = config;
          this.initializeDb();
        }
      });
    });
  }

  private initializeDb() {
    if (!this.formsConfig || !this.formsConfig.db) {
      console.error("DB Config is missing");
      return;
    }

    const dbName = this.formsConfig.db.dbName;
    const storeName = this.formsConfig.db.storeName || this.formsConfig.db.storeProject;
    const dbVersion = this.formsConfig.db.dbVersion || 1;


    const request = indexedDB.open(dbName, dbVersion);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'key' });
      }
    };

    request.onsuccess = (event: Event) => {
      this.db = (event.target as IDBOpenDBRequest).result;
      this.dbInitialized = true;
      console.log("Database initialized successfully");
    };

    request.onerror = (event: Event) => {
      console.error('Error opening database:', (event.target as IDBOpenDBRequest).error);
    };
  }

  getTransaction(key: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        console.error('Database not initialized');
        return reject('Database not initialized');
      }

      const storeName = this.formsConfig.db.storeName || this.formsConfig.db.storeProject;
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  addData(data: any): Promise<IDBValidKey> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        console.error('Database not initialized');
        return reject('Database not initialized');
      }

      const storeName = this.formsConfig.db.storeName || this.formsConfig.db.storeProject;
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  updateTransaction(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        console.error('Database not initialized');
        return reject('Database not initialized');
      }

      data.data.isDownload = false;
      const storeName = this.formsConfig.db.storeName || this.formsConfig.db.storeProject;
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = (event) => {
        resolve('Data updated successfully');
      };
      request.onerror = (event) => {
        console.error('Error updating Data: ', request.error);
        reject(request.error);
      };
    });
  }

  deleteTransaction(key: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        console.error('Database not initialized');
        return reject('Database not initialized');
      }

      const storeName = this.formsConfig.db.storeName || this.formsConfig.db.storeProject;
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => {
        resolve('Transaction has been deleted');
      };
      request.onerror = (event) => {
        console.error('Error deleting item:', request.error);
        reject(request.error);
      };
    });
  }

  getAllTransactions(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        console.error('Database not initialized');
        return reject('Database not initialized');
      }

      const storeName = this.formsConfig.db.storeName || this.formsConfig.db.storeProject;
      const transaction = this.db.transaction(storeName, 'readonly');
      const objectStore = transaction.objectStore(storeName);
      const query = objectStore.getAll();

      query.onsuccess = () => resolve(query.result);
      query.onerror = () => reject(query.error);
    });
  }

  clearDb(db: IDBDatabase, dbName: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([dbName], "readwrite");
      const store = transaction.objectStore(dbName);
      const request = store.clear();
      request.onsuccess = () => {
        resolve();
      };
      request.onerror = (event) => {
        console.error(`Failed to clear ${dbName}`);
        reject(event);
      };
    });
  }
  async clearDatabase(){
    await this.initializeDb();
    await this.clearDb(this.db, this.formsConfig.db.dbName);
  }
}