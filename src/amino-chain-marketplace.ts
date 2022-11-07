import { BigInt, Address } from "@graphprotocol/graph-ts";
import {
  listingCanceled,
  newListing,
  saleCompleted,
  saleInitiated,
  saleRefunded,
} from "../generated/AminoChainMarketplace/AminoChainMarketplace";
import {
  ExistingTokenId,
  PendingSale,
  NewListing,
  SaleInitiated,
  ListingCanceled,
  SaleCompleted,
  SaleRefunded,
  HlaHaplotypesHashed,
} from "../generated/schema";

export function handlenewListing(event: newListing): void {
  let newListing = NewListing.load(
    event.params.tokenId.toHexString() +
      "-" +
      event.block.timestamp.toHexString()
  );
  let existingTokenId = ExistingTokenId.load(
    event.params.tokenId.toHexString()
  );
  let hlaData = HlaHaplotypesHashed.load(event.params.donor.toString());

  if (!newListing) {
    newListing = new NewListing(
      event.params.tokenId.toHexString() +
        "-" +
        event.block.timestamp.toHexString()
    );
  }
  if (!existingTokenId) {
    existingTokenId = new ExistingTokenId(event.params.tokenId.toHexString());
  }

  newListing.tokenId = event.params.tokenId;
  newListing.sizeInCC = event.params.sizeInCC;
  newListing.price = event.params.price;
  newListing.donor = event.params.donor;
  newListing.bioBank = event.params.bioBank;

  existingTokenId.tokenId = event.params.tokenId;
  existingTokenId.buyer = Address.fromString(
    "0x0000000000000000000000000000000000000000"
  );
  existingTokenId.sizeInCC = event.params.sizeInCC;
  existingTokenId.price = event.params.price;
  existingTokenId.donor = event.params.donor;
  existingTokenId.bioBank = event.params.bioBank;
  existingTokenId.hlaHashes = hlaData!.id;

  newListing.save();
  existingTokenId.save();
}

export function handlesaleInitiated(event: saleInitiated): void {
  let saleInitiated = SaleInitiated.load(
    event.params.tokenId.toHexString() +
      "-" +
      event.block.timestamp.toHexString()
  );
  let existingTokenId = ExistingTokenId.load(
    event.params.tokenId.toHexString()
  );
  let pendingSale = PendingSale.load(event.params.tokenId.toHexString());

  if (!saleInitiated) {
    saleInitiated = new SaleInitiated(
      event.params.tokenId.toHexString() +
        "-" +
        event.block.timestamp.toHexString()
    );
  }
  if (!pendingSale) {
    pendingSale = new PendingSale(event.params.tokenId.toHexString());
  }

  saleInitiated.buyer = event.params.buyer;
  saleInitiated.tokenId = event.params.tokenId;
  saleInitiated.sizeInCC = event.params.sizeInCC;
  saleInitiated.donor = event.params.donor;
  saleInitiated.escrowedPayment = event.params.escrowedPrice;

  pendingSale.tokenId = event.params.tokenId;
  pendingSale.escrowedPayment = event.params.escrowedPrice;
  pendingSale.completed = false;

  existingTokenId!.buyer = event.params.buyer;
  existingTokenId!.price = BigInt.fromString("0");

  saleInitiated.save();
  pendingSale.save();
  existingTokenId!.save();
}

export function handlelistingCanceled(event: listingCanceled): void {
  let listingCanceled = ListingCanceled.load(
    event.params.tokenId.toHexString() +
      "-" +
      event.block.timestamp.toHexString()
  );
  let existingTokenId = ExistingTokenId.load(
    event.params.tokenId.toHexString()
  );

  if (!listingCanceled) {
    listingCanceled = new ListingCanceled(
      event.params.tokenId.toHexString() +
        "-" +
        event.block.timestamp.toHexString()
    );
  }

  listingCanceled.tokenId = event.params.tokenId;
  existingTokenId!.buyer = Address.fromString(
    "0x000000000000000000000000000000000000dEad"
  );

  listingCanceled.save();
  existingTokenId!.save();
}

export function handlesaleCompleted(event: saleCompleted): void {
  let saleCompleted = SaleCompleted.load(
    event.params.tokenId.toHexString() +
      "-" +
      event.block.timestamp.toHexString()
  );
  let pendingSale = PendingSale.load(event.params.tokenId.toHexString());

  if (!saleCompleted) {
    saleCompleted = new SaleCompleted(
      event.params.tokenId.toHexString() +
        "-" +
        event.block.timestamp.toHexString()
    );
  }

  saleCompleted.transactionHash = event.transaction.hash;
  saleCompleted.buyer = event.params.buyer;
  saleCompleted.tokenId = event.params.tokenId;
  saleCompleted.donor = event.params.donor;
  saleCompleted.salePrice = event.params.salePrice;
  saleCompleted.donorIncentive = event.params.donorIncentive;
  saleCompleted.protocolFee = event.params.protocolFee;

  pendingSale!.escrowedPayment = BigInt.fromString("0");
  pendingSale!.completed = true;

  saleCompleted.save();
  pendingSale!.save();
}

export function handlesaleRefunded(event: saleRefunded): void {
  let saleRefunded = SaleRefunded.load(
    event.params.tokenId.toHexString() +
      "-" +
      event.block.timestamp.toHexString()
  );
  let existingTokenId = ExistingTokenId.load(
    event.params.tokenId.toHexString()
  );
  let pendingSale = PendingSale.load(event.params.tokenId.toHexString());

  if (!saleRefunded) {
    saleRefunded = new SaleRefunded(
      event.params.tokenId.toHexString() +
        "-" +
        event.block.timestamp.toHexString()
    );
  }

  saleRefunded.tokenId = event.params.tokenId;
  saleRefunded.refundTotal = event.params.refundTotal;

  existingTokenId!.buyer = Address.fromString(
    "0x000000000000000000000000000000000000dEad"
  );

  pendingSale!.escrowedPayment = BigInt.fromString("0");
  pendingSale!.completed = true;

  saleRefunded.save();
  existingTokenId!.save();
  pendingSale!.save();
}
