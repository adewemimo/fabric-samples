/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class FinanBond extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        const bonds = [
            {
                bondId:'1',
                issuer: 'org1',
                owner: 'org2',
                faceValue: '$1000',
                price: '$1200',
                coupon: '0.05',
            },
            {
                bondId:'2',
                issuer: 'org2',
                owner: 'org1',
                faceValue: '$1000',
                price: '$1200',
                coupon: '0.05',
            },
            
        ];

        for (let i = 0; i < bonds.length; i++) {
            bonds[i].docType = 'bond';
            await ctx.stub.putState('BOND' + i, Buffer.from(JSON.stringify(bonds[i])));
            console.info('Added <--> ', bonds[i]);
        }
        console.info('============= END : Initialize Ledger ===========');
    }


    async createBond(ctx, bondId, issuer, faceValue, price, coupon) {
        console.info('============= START : Create Bond ===========');

        const bond = {
            bondId,
            docType: 'bond',
            issuer,
            owner: '',
            faceValue,
            price,
            coupon,
        };

        await ctx.stub.putState(bondId, Buffer.from(JSON.stringify(bond)));
        console.info('============= END : Create Bond ===========');
    }

    async buyBond(ctx, bondId, owner){
        console.info('============= START : buyBond ===========');

        const bondAsBytes = await ctx.stub.getState(bondId); // get the car from chaincode state
        if (!bondAsBytes || bondAsBytes.length === 0) {
            throw new Error(`${bondId} does not exist`);
        }
        const bond = JSON.parse(bondAsBytes.toString());
        bond.owner = owner;

        await ctx.stub.putState(bondId, Buffer.from(JSON.stringify(bond)));
        console.info('============= END : buyBond ===========');


    }

    async queryBond(ctx, bondId) {
        const bondAsBytes = await ctx.stub.getState(bondId); // get the bond from chaincode state
        if (!bondAsBytes || bondAsBytes.length === 0) {
            throw new Error(`${bondId} does not exist`);
        }
        console.log(bondAsBytes.toString());
        return bondAsBytes.toString();
    }

    async queryAllBond(ctx) {
        const startKey = '';
        const endKey = '';
        const allResults = [];
        for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: key, Record: record });
        }
        console.info(allResults);
        return JSON.stringify(allResults);
    }

    async changeBondOwner(ctx, bondId, newOwner) {
        console.info('============= START : changeBondOwner ===========');

        const bondAsBytes = await ctx.stub.getState(bondId); // get the bond from chaincode state
        if (!bondAsBytes || bondAsBytes.length === 0) {
            throw new Error(`${bondId} does not exist`);
        }
        const bond = JSON.parse(bondAsBytes.toString());
        bond.owner = newOwner;

        await ctx.stub.putState(bondId, Buffer.from(JSON.stringify(bond)));
        console.info('============= END : changeBondOwner ===========');
    }

}

module.exports = FinanBond;
