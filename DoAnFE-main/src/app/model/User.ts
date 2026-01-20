export class User {
  address?: string;
  phone?: string;
  name?: string;
  email?: string;
  job?: string;
  birthyear?: string;
  des?: string;
  salary?: string;
  cv?: string;
  img?: string;
  lat?: number;
  lg?: number;
  gender?: string;
  role?: string;
  introPhone?: string;
  jobTarget?: string;
  avatar?: string;
  country?: string = 'Việt Nam';
  nationality?: string = 'Việt Nam';
  experience?: string;
  province?: string = 'Hà Nội';
  ward?: string = 'Hoàn Kiếm';
  recruiterRate?: any
  constructor(address: string = '',
              phone: string = '',
              name: string = '',
              email: string = '',
              job: string = '',
              birthyear: string = '',
              des: string = '',
              salary: string = '',
              cv: string = '',
              img: string = '',
              lat: number = 21,
              lg: number = 106,
              gender: string = '',
              role: string = '',
              introPhone: string = '',
              jobTarget: string = '',
              avatar: string = '',
              country: string = '',
              nationality: string = '',
              experience: string = '',
              province: string = 'Hà Nội',
              ward: string = 'Hoàn Kiếm',
              recruiterRate = {
                totalCount: 0,
                averageRating: 0,
                rating1Star: 0,
                rating2Star: 0,
                rating3Star: 0,
                rating4Star: 0,
                rating5Star: 0
              }) {
    this.address = address;
    this.phone = phone;
    this.name = name;
    this.email = email;
    this.job = job;
    this.birthyear = birthyear;
    this.des = des;
    this.salary = salary;
    this.cv = cv;
    this.img = img;
    this.lat = lat;
    this.lg = lg;
    this.gender = gender;
    this.role = role;
    this.introPhone = introPhone;
    this.jobTarget = jobTarget;
    this.avatar = avatar;
    this.country = country || 'Việt Nam';
    this.nationality = nationality || 'Việt Nam';
    this.experience = experience;
    this.province = province || 'Hà Nội';
    this.ward = ward || 'Hoàn Kiếm';
    this.recruiterRate = recruiterRate;
  }
}

