'use strict';

const fetch = require('node-fetch');
const {Observable, forkJoin, from} = require('rxjs');
const JSDOM = require('jsdom').JSDOM;

const url = (v) => {
  return new Promise((resolve, reject) => {
    fetch('https://www.google.com').then((res) => {
      console.log('url complete');
      resolve(res);
    }).catch(err => {
      console.error(err);
    });
  });
};

const parse = (v) => {
  return new Promise((resolve, reject) => {
    JSDOM.fromURL('https://www.yahoo.co.jp').then((res) => {
      console.log('parse complete');
      resolve(res);
    }).catch(err => {
      console.error(err);
    });
  });
};

const vendorBase = {
  name: '',
  content: '',
};
const entries = [];
for (let i=0; i < 120; i++) {
  entries.push(Object.assign({}, vendorBase));
  entries[i].name = i;
  entries[i].content = `parsed content ${i}`;
}
const tasks = entries.map(vendor => {
  return Observable.create(observer => {
    from(url(vendor)).subscribe({
      next: name => {
        console.log(vendor);
        from(parse(vendor)).subscribe({
          next: data => {
            observer.next(data);
            observer.complete();
          },
          error: err => {
            observer.next(err);
            observer.complete();
          },
          complete: () => {
            console.log('finished');
          },
        });
      },
      error: err => {
        console.log(err);
        observer.next(err);
        observer.complete();
      },
    });
  });
});

const main = () => {
  return Observable.create(observer => {
    forkJoin(tasks)
      .subscribe({
        next: () => {
          console.log('asdfasdf');
          observer.next('finished all');
        },
        error: (err) => {
          console.log(err);
        },
      });
  });
};

main().subscribe((data) =>  {
  console.log('last subscribe');
  console.log(data);
});

