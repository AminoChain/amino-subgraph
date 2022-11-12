import { BigInt, Address } from "@graphprotocol/graph-ts";
import {
  listingCanceled,
  newListing,
  saleCompleted,
  saleInitiated,
  saleRefunded,
  deliveryStatusChanged,
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
  DeliveryStatusChanged,
} from "../generated/schema";

export function handlenewListing(event: newListing): void {
  let newListing = NewListing.load(
    event.params.tokenId.toString() + "-" + event.block.timestamp.toHexString()
  );
  let existingTokenId = ExistingTokenId.load(event.params.tokenId.toString());
  let hlaData = HlaHaplotypesHashed.load(event.params.donor.toHexString());

  if (!newListing) {
    newListing = new NewListing(
      event.params.tokenId.toString() +
        "-" +
        event.block.timestamp.toHexString()
    );
  }
  if (!existingTokenId) {
    existingTokenId = new ExistingTokenId(event.params.tokenId.toString());
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
  existingTokenId.mintTimestamp = event.block.timestamp;

  newListing.save();
  existingTokenId.save();
}

export function handlesaleInitiated(event: saleInitiated): void {
  let saleInitiated = SaleInitiated.load(
    event.params.tokenId.toString() + "-" + event.block.timestamp.toHexString()
  );
  let existingTokenId = ExistingTokenId.load(event.params.tokenId.toString());
  let pendingSale = PendingSale.load(event.params.tokenId.toString());

  if (!saleInitiated) {
    saleInitiated = new SaleInitiated(
      event.params.tokenId.toString() +
        "-" +
        event.block.timestamp.toHexString()
    );
  }
  if (!pendingSale) {
    pendingSale = new PendingSale(event.params.tokenId.toString());
  }

  saleInitiated.buyer = event.params.buyer;
  saleInitiated.tokenId = event.params.tokenId;
  saleInitiated.sizeInCC = event.params.sizeInCC;
  saleInitiated.donor = event.params.donor;
  saleInitiated.escrowedPayment = event.params.escrowedPrice;

  pendingSale.tokenId = event.params.tokenId;
  pendingSale.escrowedPayment = event.params.escrowedPrice;
  pendingSale.completed = false;
  pendingSale.status = "At_Origin";

  existingTokenId!.buyer = event.params.buyer;
  existingTokenId!.price = BigInt.fromString("0");

  saleInitiated.save();
  pendingSale.save();
  existingTokenId!.save();
}

export function handlelistingCanceled(event: listingCanceled): void {
  let listingCanceled = ListingCanceled.load(
    event.params.tokenId.toString() + "-" + event.block.timestamp.toHexString()
  );
  let existingTokenId = ExistingTokenId.load(event.params.tokenId.toString());

  if (!listingCanceled) {
    listingCanceled = new ListingCanceled(
      event.params.tokenId.toString() +
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
    event.params.tokenId.toString() + "-" + event.block.timestamp.toHexString()
  );
  let pendingSale = PendingSale.load(event.params.tokenId.toString());

  if (!saleCompleted) {
    saleCompleted = new SaleCompleted(
      event.params.tokenId.toString() +
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
  saleCompleted.timestamp = event.params.date;

  pendingSale!.escrowedPayment = BigInt.fromString("0");
  pendingSale!.completed = true;

  saleCompleted.save();
  pendingSale!.save();
}

export function handlesaleRefunded(event: saleRefunded): void {
  let saleRefunded = SaleRefunded.load(
    event.params.tokenId.toString() + "-" + event.block.timestamp.toHexString()
  );
  let existingTokenId = ExistingTokenId.load(event.params.tokenId.toString());
  let pendingSale = PendingSale.load(event.params.tokenId.toString());

  if (!saleRefunded) {
    saleRefunded = new SaleRefunded(
      event.params.tokenId.toString() +
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

export function handledeliveryStatusChanged(
  event: deliveryStatusChanged
): void {
  let deliveryStatusChanged = new DeliveryStatusChanged(
    event.params.tokenId.toString() + "-" + event.block.timestamp.toHexString()
  );
  let pendingSale = PendingSale.load(event.params.tokenId.toString());

  deliveryStatusChanged.tokenId = event.params.tokenId;
  if (event.params.status === 0) {
    deliveryStatusChanged.status = "At_Origin";
    pendingSale!.status = "At_Origin";
  }
  if (event.params.status === 1) {
    deliveryStatusChanged.status = "In_Transit";
    pendingSale!.status = "In_Transit";
  }
  if (event.params.status === 2) {
    deliveryStatusChanged.status = "Delivered";
    pendingSale!.status = "Delivered";
  }

  deliveryStatusChanged.save();
  pendingSale!.save();
}
