import { ServiceDetailClient } from "../../../components/services/ServiceDetailClient";
import { publicService } from "../../../services/publicService";

export default async function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const service = await publicService.getServiceCategory(id);

    if (!service) {
        return <div>Service not found</div>;
    }

    return <ServiceDetailClient service={service} />;
}
