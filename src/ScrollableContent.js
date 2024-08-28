import React from 'react';
import { Card } from 'antd';

const ScrollableContent = () => {
  // Sample data to fill the scrollable areas
  const sampleItems = Array.from({ length: 10 }, (_, i) => `Item ${i + 1}`);

  return  (
    <div style={{ display: 'flex', width: '100%', height: 'calc(100vh - 128px)' }}> {/* Adjust height to fit within layout */}
      {/* Left scrollable section */}
      <div
        style={{
          flex: 1,
          marginRight: '8px',
          overflowY: 'auto',
          padding: '16px',
          backgroundColor: '#fff',
        }}
      >
        <h2>Contact Details</h2>
        {/* Add contact details here */}
        {sampleItems.map(item => (
          <Card key={item} style={{ marginBottom: '8px' }}>
            {item}
          </Card>
        ))}
      </div>

      {/* Right scrollable section */}
      <div
        style={{
          flex: 2,
          marginRight: '8px',
          overflowY: 'auto',
          padding: '16px',
          backgroundColor: '#fff',
        }}
      >
        <h2>Activities</h2>
        {/* Add activities list here */}
        {sampleItems.map(item => (
          <Card key={item} style={{ marginBottom: '8px' }}>
            {item}
          </Card>
        ))}
      </div>

      {/* Additional right section */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          backgroundColor: '#fff',
        }}
      >
        <h2>Related Info</h2>
        {/* Add related info here */}
        {sampleItems.map(item => (
          <Card key={item} style={{ marginBottom: '8px' }}>
            {item}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ScrollableContent;
