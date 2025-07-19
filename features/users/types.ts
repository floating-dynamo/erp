export interface UserFilter {
  role?: string;
  isActive?: boolean;
  companyId?: string;
  lastLoginAt?: {
    $gte?: Date;
    $lte?: Date;
  };
  createdAt?: {
    $gte?: Date;
    $lte?: Date;
  };
}

export interface UserFilterFormValues {
  roleFilter: string;
  isActiveFilter: string;
  companyFilter: string;
  lastLoginFrom: string;
  lastLoginTo: string;
  createdFrom: string;
  createdTo: string;
}
