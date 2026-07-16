import axios from 'axios';
import { getApiBaseUrl } from './config';
import { unwrapEduOSResponse } from './envelope';
import { API_PATHS } from './paths';

export interface TenantConfig {
  tenantId: string;
  institutionName: string;
  institutionType: string;
  subdomain: string;
  studentIdLabel: string;
  facultyIdLabel: string;
}

interface EduOSTenantConfigResponse {
  tenant_id: string;
  institution_name: string;
  institution_type: string;
  subdomain: string;
  student_id_label: string;
  faculty_id_label: string;
}

export async function fetchTenantConfig(subdomain: string): Promise<TenantConfig> {
  const response = await axios.get(
    `${getApiBaseUrl()}${API_PATHS.organizations.tenantConfig}`,
    { params: { subdomain } },
  );
  const data = unwrapEduOSResponse<EduOSTenantConfigResponse>(response.data);

  return {
    tenantId: data.tenant_id,
    institutionName: data.institution_name,
    institutionType: data.institution_type,
    subdomain: data.subdomain,
    studentIdLabel: data.student_id_label,
    facultyIdLabel: data.faculty_id_label,
  };
}
