const ExcelJS = require('exceljs');

class ExcelService {
  async generateMarketplaceWorkbook(market, category, formData = {}) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Infyshopy Marketplace Studio';
    workbook.lastModifiedBy = 'Infyshopy Multi-Channel Engine';
    workbook.created = new Date();
    workbook.modified = new Date();

    const sku = formData.master_sku || 'INFY-SKU-' + Math.floor(1000 + Math.random() * 9000);
    const title = formData.title || 'Designer Embroidered Handcrafted Saree';
    const price = formData.base_price || 999;
    const mrp = formData.mrp || 2499;
    const fabric = formData.fabric || 'Pure Silk';
    const color = formData.color || 'Royal Blue';
    const blouse = formData.blouse_type || 'Separate Blouse Piece';
    const brand = formData.brand || 'Infyshopy';

    if (market === 'MEESHO') {
      const sheet = workbook.addWorksheet('Catalog');
      sheet.columns = [
        { header: 'SKU ID', key: 'sku', width: 20 },
        { header: 'Product Name', key: 'title', width: 40 },
        { header: 'Color', key: 'color', width: 15 },
        { header: 'Fabric', key: 'fabric', width: 20 },
        { header: 'Blouse Type', key: 'blouse', width: 25 },
        { header: 'Occasion', key: 'occasion', width: 20 },
        { header: 'Saree Length (m)', key: 'saree_len', width: 18 },
        { header: 'Blouse Length (m)', key: 'blouse_len', width: 18 },
        { header: 'MRP', key: 'mrp', width: 12 },
        { header: 'Meesho Price', key: 'price', width: 15 },
        { header: 'GST %', key: 'gst', width: 10 },
        { header: 'HSN Code', key: 'hsn', width: 12 },
        { header: 'Front Image URL', key: 'img1', width: 35 },
        { header: 'Back Image URL', key: 'img2', width: 35 }
      ];

      sheet.addRow({
        sku,
        title,
        color,
        fabric,
        blouse,
        occasion: 'Festive / Wedding',
        saree_len: '5.5',
        blouse_len: '0.8',
        mrp,
        price,
        gst: 5,
        hsn: '5407',
        img1: 'https://res.cloudinary.com/infyshopy/image/upload/v1/sarees/front_sample.jpg',
        img2: 'https://res.cloudinary.com/infyshopy/image/upload/v1/sarees/back_sample.jpg'
      });
      this.styleHeaderRow(sheet);
    } else if (market === 'FLIPKART') {
      const sheet = workbook.addWorksheet('QC Sheet');
      sheet.columns = [
        { header: 'Seller SKU', key: 'sku', width: 20 },
        { header: 'Brand', key: 'brand', width: 20 },
        { header: 'Style Code', key: 'style', width: 20 },
        { header: 'Type', key: 'type', width: 20 },
        { header: 'Fabric', key: 'fabric', width: 20 },
        { header: 'Blouse Piece', key: 'blouse', width: 20 },
        { header: 'Color', key: 'color', width: 15 },
        { header: 'MRP', key: 'mrp', width: 12 },
        { header: 'Your Selling Price', key: 'price', width: 18 },
        { header: 'Main Image URL', key: 'img1', width: 35 }
      ];

      sheet.addRow({
        sku,
        brand,
        style: sku,
        type: 'Regular Saree',
        fabric,
        blouse: 'Unstitched',
        color,
        mrp,
        price: Number(price) + 150, // absorbing flipkart commission
        img1: 'https://res.cloudinary.com/infyshopy/image/upload/v1/sarees/front_sample.jpg'
      });
      this.styleHeaderRow(sheet);
    } else if (market === 'AMAZON') {
      const sheet = workbook.addWorksheet('Template');
      sheet.columns = [
        { header: 'item_sku', key: 'sku', width: 20 },
        { header: 'brand_name', key: 'brand', width: 20 },
        { header: 'item_name', key: 'title', width: 45 },
        { header: 'feed_product_type', key: 'feed_type', width: 20 },
        { header: 'standard_price', key: 'price', width: 15 },
        { header: 'list_price', key: 'mrp', width: 15 },
        { header: 'material_type', key: 'fabric', width: 20 },
        { header: 'color_name', key: 'color', width: 15 },
        { header: 'main_image_url', key: 'img1', width: 35 }
      ];

      sheet.addRow({
        sku,
        brand,
        title,
        feed_type: 'saree',
        price: Number(price) + 200,
        mrp,
        fabric,
        color,
        img1: 'https://res.cloudinary.com/infyshopy/image/upload/v1/sarees/front_sample.jpg'
      });
      this.styleHeaderRow(sheet);
    } else {
      // Myntra, Snapdeal, SmartBiz
      const sheet = workbook.addWorksheet(market + ' Catalog');
      sheet.columns = [
        { header: 'SKU', key: 'sku', width: 20 },
        { header: 'Brand', key: 'brand', width: 20 },
        { header: 'Product Title', key: 'title', width: 40 },
        { header: 'Category', key: 'category', width: 18 },
        { header: 'Fabric', key: 'fabric', width: 18 },
        { header: 'MRP', key: 'mrp', width: 12 },
        { header: 'Price', key: 'price', width: 12 },
        { header: 'Image URL', key: 'img1', width: 35 }
      ];

      sheet.addRow({
        sku,
        brand,
        title,
        category,
        fabric,
        mrp,
        price,
        img1: 'https://res.cloudinary.com/infyshopy/image/upload/v1/sarees/front_sample.jpg'
      });
      this.styleHeaderRow(sheet);
    }

    return workbook;
  }

  styleHeaderRow(sheet) {
    const headerRow = sheet.getRow(1);
    headerRow.font = { name: 'Segoe UI', bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF143E32' } // Infyshopy forest green
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 24;
  }
}

module.exports = new ExcelService();

