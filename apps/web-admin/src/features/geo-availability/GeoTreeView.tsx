
// apps/web-admin/src/features/geo-availability/GeoTreeView.tsx
import React, { useState, useEffect } from 'react';
import { TreeSelect } from 'antd'; // Assuming Ant Design
import { useGeoService } from './useGeoService';

interface Props {
    onSelectPincode: (value: string, node: any) => void;
}

const GeoTreeView = ({ onSelectPincode }: Props) => {
    const [treeData, setTreeData] = useState<any[]>([]);
    const { fetchNode } = useGeoService();

    useEffect(() => {
        // Load initial states
        fetchNode('STATE').then((response: any) => {
            const data = response?.data;
            if (data) {
                setTreeData(data.map((s: any) => ({
                    id: s.id,
                    pId: 0,
                    value: s.id,
                    title: s.name,
                    isLeaf: false,
                    type: 'STATE'
                })));
            }
        });
    }, []);

    const onLoadData = ({ id, type, children, dataRef }: any) => {
        return new Promise<void>(async (resolve) => {
            if (children) {
                resolve();
                return;
            }

            // If dataRef is present (from previous load), use it for context if needed, 
            // but here we use props passed by tree logic which usually includes custom props like 'type'

            let nextType = type === 'STATE' ? 'CITY' : 'PINCODE';
            // Stop if PINCODE (leaves)
            if (type === 'PINCODE') {
                resolve();
                return;
            }

            const result = await fetchNode(nextType as 'CITY' | 'PINCODE', id);
            const data = result?.data;

            setTreeData(origin => {
                const newNodes = (data || []).map((n: any) => ({
                    id: n.id || n.pincode_id,
                    pId: id,
                    value: n.id || n.pincode_id,
                    title: n.name || `${n.pincode} - ${n.area_name}`,
                    isLeaf: nextType === 'PINCODE',
                    type: nextType
                }));
                return origin.concat(newNodes);
            });
            resolve();
        });
    };

    return (
        <TreeSelect
            treeDataSimpleMode
            style={{ width: '100%' }}
            value={undefined}
            dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
            placeholder="Select Area"
            onChange={onSelectPincode}
            loadData={onLoadData}
            treeData={treeData}
        />
    );
};

export default GeoTreeView;
