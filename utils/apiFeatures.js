class APIFeatures {
   constructor(query, queryString) {
      this.query = query;
      this.queryString = queryString;
   }
   filter() {
      //Filtering
      const queryObjs = { ...this.queryString };
      const excludeFields = ['page', 'sort', 'limit', 'select', 'fields'];
      //excludeFields.map((ele) => delete queryObjs[ele]);
      excludeFields.forEach((ele) => delete queryObjs[ele]);
      // Advance filtering

      let qString = JSON.stringify(queryObjs);
      console.log(`Filter : ${qString}`);

      const qStringObject = JSON.parse(
         qString.replace(/\b(gt|lt|gte|lte)\b/g, (match) => `$${match}`),
      );
      this.query = this.query.find(qStringObject);
      //let query = Tour.find(qStringObject);
      return this;
   }
   sort() {
      //Sorting
      console.log('sort : ' + this.queryString.sort);
      if (this.queryString.sort) {
         let sortedBy = this.queryString.sort;
         sortedBy = sortedBy.split(',').join(' ');
         //console.log(`Sort : ${sortedBy}`);
         this.query = this.query.sort(sortedBy);
      } else {
         this.query = this.query.sort('-createdAt');
      }
      return this;
   }
   select() {
      //selection fields
      if (this.queryString.fields) {
         //console.log(this.queryString.fields);
         //console.log();
         const fuelds = this.queryString.fields.split(',').join(' ');
         //selection fields
         this.query = this.query.select(fuelds);
         console.log(`Select : ${fuelds}`);
      } else {
         this.query = this.query.select('-__v');
      }
      return this;
   }
   async pagination() {
      //Pagination

      const limit = this.queryString.limit * 1 || process.env.PAGESIZE;
      const page = this.queryString.page * 1 || 1;
      this.skipNum = (page - 1) * limit;
      this.query = this.query.skip(this.skipNum).limit(limit);
      // let numTours = 0;
      // if (this.queryString.page) {
      //    numTours = await this.query.countDocuments();
      //    //console.log(`Total records:${numTours}`);
      //    if (this.skipNum >= numTours)
      //       throw new Error('This page does not exists.');
      // }
      return this;
   }
}

module.exports = APIFeatures;
