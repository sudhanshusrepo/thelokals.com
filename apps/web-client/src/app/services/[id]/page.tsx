import { ServiceDetailClient } from "../../../components/services/ServiceDetailClient";
import { adminService } from "@thelocals/platform-core/services/adminService";

export default async function ServiceDetailPage({ params }: { params: { id: string } }) {
    const service = await adminService.getServiceCategory(params.id);

    if (!service) {
        return <div>Service not found</div>;
    }

    return <ServiceDetailClient service={service} />;
}
