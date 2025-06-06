import React, { useEffect, useState } from "react";
import UpgrageRow from "./upgrade_row";
import "./spend_bounty_points_panel.css";

const SpendBountyPointsPanel = ({
  upgradesArray,
  setUpgradesArray,
  character,
  hasEnoughBountyPoints,
  setHasEnoughBountyPoints,
  bountyPoints,
  setBountyPoints,
  remainingBountyPoints,
  setRemainingBountyPoints,
}) => {
  const [displayedUpgrades, setDisplayedUpgrades] = useState([]);

  const [totalBountyPointsToSpend, setTotalBountyPointsToSpend] = useState(0);

  const returnTotalCost = () => {
    const costsArray = upgradesArray.map((element) => {
      return element.cost;
    });
    const totalCost = costsArray.reduce(
      (accumulator, currentValue) => accumulator + currentValue
    );
    return totalCost;
  };

  useEffect(() => {
    const renderUpgrades = upgradesArray.map((element) => {
      return (
        <UpgrageRow
          key={`${Date.now()}-${Math.random()}`}
          upgradesArray={upgradesArray}
          setUpgradesArray={setUpgradesArray}
          element={element}
          setRemainingBountyPoints={setRemainingBountyPoints}
        />
      );
    });

    if (upgradesArray.length > 0) {
      const runningCost = returnTotalCost();
      if (runningCost <= character.bountyPoints) {
        setHasEnoughBountyPoints(true);
      } else {
        setHasEnoughBountyPoints(false);
      }
      setDisplayedUpgrades(renderUpgrades);
      setTotalBountyPointsToSpend(returnTotalCost);
    } else {
      setDisplayedUpgrades(
        <div className="bounty-points-cart__empty-state">
          Select stats you'd like to upgrade
        </div>
      );
    }
  }, [upgradesArray]);

  const handleBountyPointsPanelCancel = () => {
    setUpgradesArray([]);
    setTotalBountyPointsToSpend(0);
    setRemainingBountyPoints(bountyPoints);
    setHasEnoughBountyPoints(true);
  };

  const updateCharacterStats = async (_id, key, value) => {
    // Call the Netlify function
    const response = await fetch("/.netlify/functions/update_character", {
      method: "POST",
      body: JSON.stringify({ _id, key, value }),
    });
    const data = await response.json();
  };

  const returnValueToUpdate = (currentUpgrade) => {
    const dieTypeArray = [4, 6, 8, 10, 12, 20, 100];
    if (currentUpgrade.upgradeType === "dieSides") {
      const currentDieTypeIndex = dieTypeArray.findIndex(
        (element) => element === currentUpgrade.stat.dieSides
      );
      return dieTypeArray[currentDieTypeIndex + 1];
    } else if (currentUpgrade.upgradeType === "dieCount") {
      return currentUpgrade.stat.dieCount + 1;
    }
  };

  const handleSpendPointsClick = async () => {
    if (hasEnoughBountyPoints) {
      const remainingBountyPoints =
        character.bountyPoints - totalBountyPointsToSpend;
      for (let i = 0; i < upgradesArray.length; i++) {
        const currentUpgrade = upgradesArray[i];
        const statToUpdate = `${currentUpgrade.jsonStatIndex}.${currentUpgrade.upgradeType}`;
        const valueToUpdate = returnValueToUpdate(currentUpgrade);
        await updateCharacterStats(character._id, statToUpdate, valueToUpdate);
      }
      await updateCharacterStats(
        character._id,
        `bountyPoints`,
        remainingBountyPoints
      );
      setBountyPoints(remainingBountyPoints);
      setUpgradesArray([]);
      setTotalBountyPointsToSpend(0);
    }
  };

  return (
    <div className="panel panel__panel-right">
      <div className="bounty-points-cart__remaining-points">
        Remaining Bounty Points:{" "}
        <span className="bounty-points-cart__remaining-points-value">
          {remainingBountyPoints}
        </span>
      </div>
      <div className="bounty-points-cart">{displayedUpgrades}</div>
      <div className="panel-right__button-row">
        <button
          className="button button_large button_fill-width button__button-secondary"
          onClick={handleBountyPointsPanelCancel}
        >
          Cancel
        </button>
        <button
          disabled={!hasEnoughBountyPoints || upgradesArray.length === 0}
          className="button button_large button_fill-width button__button-primary"
          onClick={handleSpendPointsClick}
        >
          Spend Points
        </button>
      </div>
    </div>
  );
};

export default SpendBountyPointsPanel;
