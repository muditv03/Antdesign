import React, { useEffect, useState } from "react";
import ApiService from '../Components/apiService'; // Import ApiService class
import { BASE_URL } from '../Components/Constant';
import { Row, Col, Card, Button, Typography } from 'antd';
import LayoutEditor from "./LayoutEditor";

const { Title } = Typography;

const CreateLayout = ({ object }) => {
    const [layouts, setLayouts] = useState([]);
    const [showLayoutEditor, setShowLayoutEditor] = useState(false);
    const [fields, setFields] = useState({});
    const [selectedLayout, setSelectedLayout] = useState(null); // Store the selected layout for editing

    const getAllLayouts = async () => {
        try {
            const apiService = new ApiService(`${BASE_URL}/get_by_objectName/${object.name}`, {}, 'GET');
            const FieldapiService = new ApiService(`${BASE_URL}/mt_fields/object/${object.name}`, {}, 'GET');
            const responseData = await apiService.makeCall();
            const fieldResponse = await FieldapiService.makeCall();
            const filteredFields = fieldResponse.filter(field => field.name !== 'recordCount'); // Filter out 'recordCount'

            setLayouts(responseData);
            setFields(filteredFields);
        } catch (error) {
            console.error('Error fetching layouts or fields:', error);
        }
    };

    useEffect(() => {
        getAllLayouts();
    }, [object]);

    const handleEditLayout = (layout) => {
        setSelectedLayout(layout); // Set the selected layout for editing
        setShowLayoutEditor(true); // Show the LayoutEditor
    };

    const renderItems = (items) => {
        return (
            <div>
                {items && items.map((item, index) => (
                    <Row key={index} style={{ marginBottom: 10 }}>
                        <Col span={24}>{item.name}</Col> {/* Item displayed in a row under each column */}
                    </Row>
                ))}
            </div>
        );
    };

    const renderSections = (sections) => {
        return (
            <div>
                {sections.map((section, index) => (
                    <Card key={index} title={section.name} style={{ marginBottom: 20,marginTop:20 }}>
                        <Row gutter={16}>
                            {section.columns.map((column, colIndex) => {
                                const columnSpan = 24 / section.columns.length; // Calculate dynamic span based on the number of columns
                                return (
                                    <Col key={colIndex} span={columnSpan}>
                                        <div style={{ marginBottom: 10 }}>
                                            <strong>Column {column.order}:</strong>
                                            {renderItems(column.items)} {/* Render items under the column */}
                                        </div>
                                    </Col>
                                );
                            })}
                        </Row>
                    </Card>
                ))}
            </div>
        );
    };

    return (
        <div>
            {!showLayoutEditor ? (
                // Main View
                <div>
                    <Row justify="space-between" align="middle" style={{ marginBottom: 10 }}>
                        <Col>
                            <Title level={3} style={{ marginTop: "10px" }}>Create Layouts</Title>
                        </Col>
                        <Col style={{ marginTop: "10px" }}>
                            <Button
                                type="primary"
                                onClick={() => {
                                    setSelectedLayout(null); // Clear selected layout
                                    setShowLayoutEditor(true); // Show LayoutEditor for new layout
                                }}
                                style={{ marginBottom: 5 }}
                            >
                                Create Layout
                            </Button>
                        </Col>
                    </Row>

                    <div>
                        {/* Render All Layouts */}
                        {layouts.length > 0 ? (
                        layouts.map((layout) => (
                            <Card key={layout._id} style={{ marginBottom: 20 }}>
                                <Row justify="space-between" align="middle" style={{padding:'auto'}}>
                                    <Col>
                                        <Title level={4} style={{ margin: 0 }}>
                                            {layout.layout_name}
                                        </Title>
                                    </Col>
                                    <Col>
                                        <Button
                                            color="default" 
                                            variant="dashed"
                                            onClick={() => handleEditLayout(layout)}
                                        >
                                            Edit Layout
                                        </Button>
                                    </Col>
                                </Row>
                                {renderSections(layout.sections)}
                            </Card>
                        ))
                    ) : (
                        <p>No layouts available.</p>
                    )}

                    </div>
                </div>
            ) : (
                // LayoutEditor View
                <LayoutEditor
                    object={object.name}
                    fields={fields}
                    Editinglayout={selectedLayout} // Pass the selected layout to LayoutEditor
                    getAllLayouts={getAllLayouts}
                    onBack={() => setShowLayoutEditor(false)} // Pass onBack callback
                />
            )}
        </div>
    );
};

export default CreateLayout;
