import { Bom } from '@/features/bom/schemas';

const BOMS_MOCK_DATA: Bom[] = [
  {
    id: '1',
    bomNumber: 'BOM/25/01/15/00001',
    bomName: 'Laptop Assembly BOM',
    productName: 'High-Performance Laptop',
    productCode: 'HP-LT-001',
    version: '1.0',
    bomDate: '2025-01-15',
    bomType: 'MANUFACTURING',
    status: 'ACTIVE',
    items: [
      {
        itemCode: 1001,
        itemDescription: 'Motherboard',
        materialConsideration: 'High-end gaming motherboard',
        quantity: 1,
        uom: 'Piece',
        rate: 15000,
        currency: 'INR',
        amount: 15000,
        remarks: 'Primary component',
        level: 0,
        children: [
          {
            itemCode: 1002,
            itemDescription: 'CPU Socket',
            materialConsideration: 'LGA 1200 socket',
            quantity: 1,
            uom: 'Piece',
            rate: 500,
            currency: 'INR',
            amount: 500,
            remarks: 'Integrated with motherboard',
            level: 1,
            parentId: '1001',
            children: []
          },
          {
            itemCode: 1003,
            itemDescription: 'RAM Slots',
            materialConsideration: 'DDR4 slots',
            quantity: 4,
            uom: 'Piece',
            rate: 200,
            currency: 'INR',
            amount: 800,
            remarks: 'Memory expansion slots',
            level: 1,
            parentId: '1001',
            children: []
          }
        ]
      },
      {
        itemCode: 2001,
        itemDescription: 'Processor',
        materialConsideration: 'Intel Core i7',
        quantity: 1,
        uom: 'Piece',
        rate: 25000,
        currency: 'INR',
        amount: 25000,
        remarks: 'High-performance CPU',
        level: 0,
        children: [
          {
            itemCode: 2002,
            itemDescription: 'CPU Cooler',
            materialConsideration: 'Liquid cooling system',
            quantity: 1,
            uom: 'Piece',
            rate: 3000,
            currency: 'INR',
            amount: 3000,
            remarks: 'Essential for cooling',
            level: 1,
            parentId: '2001',
            children: []
          }
        ]
      },
      {
        itemCode: 3001,
        itemDescription: 'Memory (RAM)',
        materialConsideration: 'DDR4 32GB Kit',
        quantity: 1,
        uom: 'Kit',
        rate: 12000,
        currency: 'INR',
        amount: 12000,
        remarks: 'High-speed memory',
        level: 0,
        children: []
      }
    ],
    totalMaterialCost: 56300,
    description: 'Complete bill of materials for high-performance laptop assembly',
    notes: 'Ensure all components are tested before assembly',
    myCompanyName: 'Tech Solutions Pvt Ltd',
    createdBy: 'John Doe',
    approvedBy: 'Jane Smith',
    approvalDate: '2025-01-16'
  },
  {
    id: '2',
    bomNumber: 'BOM/25/01/20/00002',
    bomName: 'Office Chair BOM',
    productName: 'Ergonomic Office Chair',
    productCode: 'EOC-001',
    version: '2.1',
    bomDate: '2025-01-20',
    bomType: 'MANUFACTURING',
    status: 'ACTIVE',
    items: [
      {
        itemCode: 4001,
        itemDescription: 'Chair Base',
        materialConsideration: 'Aluminum 5-star base',
        quantity: 1,
        uom: 'Piece',
        rate: 2500,
        currency: 'INR',
        amount: 2500,
        remarks: 'Sturdy base structure',
        level: 0,
        children: [
          {
            itemCode: 4002,
            itemDescription: 'Caster Wheels',
            materialConsideration: 'Smooth rolling wheels',
            quantity: 5,
            uom: 'Piece',
            rate: 150,
            currency: 'INR',
            amount: 750,
            remarks: 'For mobility',
            level: 1,
            parentId: '4001',
            children: []
          }
        ]
      },
      {
        itemCode: 5001,
        itemDescription: 'Seat Cushion',
        materialConsideration: 'Memory foam padding',
        quantity: 1,
        uom: 'Piece',
        rate: 1800,
        currency: 'INR',
        amount: 1800,
        remarks: 'Comfort padding',
        level: 0,
        children: []
      },
      {
        itemCode: 6001,
        itemDescription: 'Backrest',
        materialConsideration: 'Mesh back support',
        quantity: 1,
        uom: 'Piece',
        rate: 2200,
        currency: 'INR',
        amount: 2200,
        remarks: 'Ergonomic support',
        level: 0,
        children: [
          {
            itemCode: 6002,
            itemDescription: 'Lumbar Support',
            materialConsideration: 'Adjustable lumbar cushion',
            quantity: 1,
            uom: 'Piece',
            rate: 800,
            currency: 'INR',
            amount: 800,
            remarks: 'Lower back support',
            level: 1,
            parentId: '6001',
            children: []
          }
        ]
      }
    ],
    totalMaterialCost: 8050,
    description: 'Complete BOM for ergonomic office chair manufacturing',
    notes: 'Quality check required for all fabric and foam components',
    myCompanyName: 'Office Furniture Ltd',
    createdBy: 'Mike Johnson',
    approvedBy: 'Sarah Wilson',
    approvalDate: '2025-01-21'
  },
  {
    id: '3',
    bomNumber: 'BOM/25/02/01/00003',
    bomName: 'Smartphone Assembly BOM',
    productName: 'Advanced Smartphone',
    productCode: 'AS-SM-001',
    version: '1.5',
    bomDate: '2025-02-01',
    bomType: 'ENGINEERING',
    status: 'DRAFT',
    items: [
      {
        itemCode: 7001,
        itemDescription: 'Display Module',
        materialConsideration: 'OLED 6.5 inch display',
        quantity: 1,
        uom: 'Piece',
        rate: 8000,
        currency: 'INR',
        amount: 8000,
        remarks: 'High-resolution display',
        level: 0,
        children: [
          {
            itemCode: 7002,
            itemDescription: 'Touch Sensor',
            materialConsideration: 'Capacitive touch layer',
            quantity: 1,
            uom: 'Piece',
            rate: 1500,
            currency: 'INR',
            amount: 1500,
            remarks: 'Multi-touch support',
            level: 1,
            parentId: '7001',
            children: []
          }
        ]
      },
      {
        itemCode: 8001,
        itemDescription: 'Battery',
        materialConsideration: 'Lithium-ion 4000mAh',
        quantity: 1,
        uom: 'Piece',
        rate: 1200,
        currency: 'INR',
        amount: 1200,
        remarks: 'Long-lasting battery',
        level: 0,
        children: []
      },
      {
        itemCode: 9001,
        itemDescription: 'Camera Module',
        materialConsideration: '48MP triple camera system',
        quantity: 1,
        uom: 'Set',
        rate: 5500,
        currency: 'INR',
        amount: 5500,
        remarks: 'Professional photography',
        level: 0,
        children: [
          {
            itemCode: 9002,
            itemDescription: 'Main Camera Lens',
            materialConsideration: '48MP wide-angle lens',
            quantity: 1,
            uom: 'Piece',
            rate: 2000,
            currency: 'INR',
            amount: 2000,
            remarks: 'Primary camera',
            level: 1,
            parentId: '9001',
            children: []
          },
          {
            itemCode: 9003,
            itemDescription: 'Ultra-wide Lens',
            materialConsideration: '12MP ultra-wide lens',
            quantity: 1,
            uom: 'Piece',
            rate: 1500,
            currency: 'INR',
            amount: 1500,
            remarks: 'Wide-angle photography',
            level: 1,
            parentId: '9001',
            children: []
          }
        ]
      }
    ],
    totalMaterialCost: 19700,
    description: 'Engineering BOM for advanced smartphone with triple camera system',
    notes: 'Component testing in progress, awaiting final approval',
    myCompanyName: 'Mobile Tech Solutions',
    createdBy: 'Alice Chen',
    approvedBy: undefined,
    approvalDate: undefined
  }
];

export default BOMS_MOCK_DATA;