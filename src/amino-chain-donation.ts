import { BigInt } from "@graphprotocol/graph-ts";
import { NFTMinted as NFTMintedEvent } from "../generated/AminoChainDonation/AminoChainDonation";
import {
  StemCellDonationTokenized,
  HlaHaplotypesHashed,
} from "../generated/schema";

export function handleNFTMinted(event: NFTMintedEvent): void {
  let nftMinted = new StemCellDonationTokenized(
    event.params.donor.toHexString() + "-" + event.block.timestamp.toHexString()
  );
  let hlaData = new HlaHaplotypesHashed(event.params.donor.toHexString());
  hlaData.hlaHashed_A = event.params.hlaHashed.A;
  hlaData.hlaHashed_B = event.params.hlaHashed.B;
  hlaData.hlaHashed_C = event.params.hlaHashed.C;
  hlaData.hlaHashed_DPB = event.params.hlaHashed.DPB;
  hlaData.hlaHashed_DRB = event.params.hlaHashed.DRB;
  hlaData.save();

  nftMinted.donor = event.params.donor;
  nftMinted.hlaHashes = hlaData.id;
  nftMinted.timestamp = event.block.timestamp;

  let ids: BigInt[] = new Array();
  let ccAmounts: BigInt[] = new Array();
  for (let i = 0; i < event.params.tokenIds.length; i++) {
    ids.push(BigInt.fromString(event.params.tokenIds[i].toString()));
    ccAmounts.push(BigInt.fromString(event.params.amounts[i].toString()));
  }

  nftMinted.tokenIds = ids;
  nftMinted.amounts = ccAmounts;

  nftMinted.save();
}
