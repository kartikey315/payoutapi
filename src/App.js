import logo from './logo.svg';
import './App.css';
import axios from 'axios';
import MetaOmatic from './abi.json';
import { useState, useEffect } from 'react';
import { ethers } from "ethers";
import CryptoJS from "crypto-js";
import { ENCRYPTION_KEY, ENCRYPTION_IV, TOKEN } from './config'


function App() {

  const contractAddress = '0x2d0953b542E34A330Dd36d6D127363c0Be850b0b';
  const [key, setKey] = useState('');

  const decryptData = (key) => {
    const enc_key = CryptoJS.enc.Hex.parse(ENCRYPTION_KEY);
    const enc_iv = CryptoJS.enc.Hex.parse(ENCRYPTION_IV);
    const decrypted = CryptoJS.AES.decrypt(key, enc_key, { iv: enc_iv });
    setKey(decrypted.toString(CryptoJS.enc.Utf8));
  }
 
  
  const payout = async () => {
    
    const provider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed.binance.org');

    const privateKey = key;
    const payoutWallet = new ethers.Wallet(privateKey, provider);

    let payoutArr = [];
    
    let payoutAdress = [];
    let payoutAmount = [];
    let txnId = '';

    for (let i = 0; i < payoutArr.length; i++) {

      payoutAdress[i] = payoutArr[i].idno;
      payoutAmount[i] = ethers.utils.parseEther(payoutArr[i].Balance);

    }
    console.log("payoutwallet" + payoutWallet.address)
    const contractWithWallet = new ethers.Contract(contractAddress, MetaOmatic.output.abi, payoutWallet);

    try {
      const payoutTxn = await contractWithWallet.refPayout(payoutAdress, payoutAmount, { gasLimit: 99000000 });
      console.log("payoutTxnHash" + payoutTxn.hash);

      const payoutTxnhash = payoutTxn.hash;
      const deductPayout = await axios.get(`https://htcg.io/CheckLogin.aspx?token=Monosmos67897sf2ntskhsr042jas65ix&action=deductwallet&TxnData=${payoutTxnhash}&txnid=${txnId}&Status=SUCCESS`)

      console.log(deductPayout);
    }
    catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    localStorage.removeItem('userAddress');
    
    const getEthersAPIKey = async () => {
      const apiKeyRes = await axios.get(`https://php.htcg.io/index.php`, { headers: { "Content-Type": 'application/json', "Authorization": `Bearer ${TOKEN}` } });
      if (Object.keys(apiKeyRes).length > 0 && apiKeyRes.data.status == 1) {
        decryptData(apiKeyRes.data.data);
      }
      //setUsers(users);
    };

    getEthersAPIKey(); // run it, run it
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <div onClick={payout}>Give Payout</div>
      </header>
    </div>
  );
}

export default App;
