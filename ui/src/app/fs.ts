// from log in **************

// const role = this.loaderService.getTokenData('role');

//         if (role === 'admin' && this.signinAs === 'admin') {
//           this.router.navigate(['/admin/adminselection']);
//         } else if (role === 'user' && this.signinAs === 'teacher') {

//           this.studentsService.getAuthTeacher().subscribe({
//             next: (data) => {
//               if (data || data.length > 0) {
//                 this.studentsService.setAuthTeacher(data);
//                 this.router.navigate(['/main/students']);
//               }
//             },
//             error: (error) => {
//               console.error('Error fetching authenticated teacher:', error);
//             },
//           });
//         }else{
//           console.error('Invalid role or signinAs value');
//         }