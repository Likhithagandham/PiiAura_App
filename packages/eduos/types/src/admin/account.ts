export interface AdminAccountProfileData {
  userId: string;
  name: string;
  role: string;
  roleLabel: string;
  phone: string | null;
  email: string | null;
  institutionName: string;
  branchName: string | null;
  branchId: string | null;
  institutionType: "school" | "college";
  dateJoined: string | null;
}
