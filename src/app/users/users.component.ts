import { Component, OnInit } from '@angular/core';
import { AdminService, User } from '../services/admin.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
})
export class UsersComponent implements OnInit {

  users: User[] = [];
  loading = true;
  error   = '';
  searchTerm = '';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  get filteredUsers(): User[] {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) return this.users;
    return this.users.filter(u =>
      u.name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.role?.toLowerCase().includes(term)
    );
  }

  loadUsers() {
    this.loading = true;
    this.adminService.getUsers().subscribe({
      next:  (data) => { this.users = data; this.loading = false; },
      error: (err)  => { this.error = err.message; this.loading = false; },
    });
  }

  archiveUser(id: string) {
    if (!confirm('Voulez-vous vraiment archiver cet utilisateur ?')) return;

    this.adminService.archiveUser(id).subscribe({
      next:  () => { this.users = this.users.filter(u => u._id !== id); },
      error: (err) => alert('Erreur : ' + err.message),
    });
  }

  toggleBlock(id: string) {
    this.adminService.toggleBlock(id).subscribe({
      next: (res) => {
        const u = this.users.find(u => u._id === id);
        if (u) u.isBlocked = res.isBlocked;
      },
      error: (err) => alert('Erreur : ' + err.message),
    });
  }
}
