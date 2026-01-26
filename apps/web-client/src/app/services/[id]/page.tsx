import { ServiceDetailClient } from "../../../components/services/ServiceDetailClient";
import { publicService } from "../../../services/publicService";

export default async function ServiceDetailPage({ params }: { params: { id: string } }) {
    const service = await publicService.getServiceCategory(params.id);

    if (!service) {
        return <div>Service not found</div>;
    }

    return <ServiceDetailClient service={service} />;
}
