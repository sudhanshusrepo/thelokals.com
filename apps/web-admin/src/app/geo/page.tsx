
'use client';

import React, { useState } from 'react';
import { Card, Col, Row, Typography } from 'antd';
import GeoTreeView from '../../features/geo-availability/GeoTreeView';
import ServiceAvailabilityForm from '../../features/geo-availability/ServiceAvailabilityForm';

const { Title } = Typography;

export default function GeoPage() {
    // Shared state between tree and form
    // selectedNode will contain { id, type, title }
    const [selectedNode, setSelectedNode] = useState<any>(null);

    const onSelectPincode = (value: string, node: any) => {
        // AntD TreeSelect onSelect provides (value, node object)
        // We need to parse or ensure node has the data we need

        setSelectedNode({
            value: node.value,
            title: node.title,
            type: node.type,
            ...node
        });
    };

    return (
        <div className="p-6">
            <Title level={2}>Geo-Service Availability</Title>
            <p className="mb-6 text-gray-500">
                Control service availability at State, City, or Pincode level.
                Select a location from the tree to view and modify rules.
            </p>

            <Row gutter={24}>
                <Col span={10}>
                    <Card title="Location Hierarchy" className="h-full">
                        <GeoTreeView onSelectPincode={onSelectPincode} />
                    </Card>
                </Col>
                <Col span={14}>
                    <Card title="Availability Rules" className="h-full">
                        {selectedNode ? (
                            <ServiceAvailabilityForm selectedNode={selectedNode} />
                        ) : (
                            <div className="text-center py-10 text-gray-400">
                                Select a location to manage services.
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
