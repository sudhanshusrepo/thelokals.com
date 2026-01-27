
// apps/web-admin/src/features/geo-availability/ServiceAvailabilityForm.tsx
import React, { useState } from 'react';
import { Form, Switch, Button, Select, message } from 'antd';
import { useGeoService } from './useGeoService';

interface Props {
    selectedNode: {
        type: 'STATE' | 'CITY' | 'PINCODE';
        value: string;
        title: string;
    } | null;
}

const ServiceAvailabilityForm = ({ selectedNode }: Props) => {
    const [form] = Form.useForm();
    const { toggleAvailability, fetchServices, loading } = useGeoService();
    const [services, setServices] = useState([]);

    React.useEffect(() => {
        fetchServices().then(({ data }) => {
            if (data) {
                setServices(data.map((s: { name: string; id: string }) => ({ label: s.name, value: s.id })));
            }
        });
    }, []);

    const onFinish = async (values: any) => {
        if (!selectedNode) return;

        // Scope type inference (could be passed prop)
        const scopeType = selectedNode.type;

        const success = await toggleAvailability(
            values.serviceId,
            scopeType,
            selectedNode.value,
            values.isEnabled
        );

        if (success) {
            message.success('Rule updated!');
        } else {
            message.error('Failed to update rule.');
        }
    };

    if (!selectedNode) return <div>Select a location to edit rules.</div>;

    return (
        <Form form={form} onFinish={onFinish} layout="vertical">
            <h3>Editing: {selectedNode.title}</h3>

            <Form.Item name="serviceId" label="Service" rules={[{ required: true }]}>
                <Select placeholder="Select Service" options={services} />
            </Form.Item>

            <Form.Item name="isEnabled" label="Enabled" valuePropName="checked">
                <Switch />
            </Form.Item>

            <Button type="primary" htmlType="submit" loading={loading}>
                Save Rule
            </Button>
        </Form>
    );
};

export default ServiceAvailabilityForm;
