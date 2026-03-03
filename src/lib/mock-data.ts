import { type Dataset } from '@/lib/dataset-service';

export type Paper = {
  title: string;
  authors: string[];
  source: string;
  url: string;
  description: string;
};



export const samplePapers: Paper[] = [
  {
    title: 'Attention Is All You Need',
    authors: ['Ashish Vaswani', 'Noam Shazeer', 'Niki Parmar', 'Jakob Uszkoreit', 'Llion Jones', 'Aidan N. Gomez', 'Łukasz Kaiser', 'Illia Polosukhin'],
    source: 'arXiv',
    url: 'https://arxiv.org/abs/1706.03762',
    description: 'This paper introduces the Transformer, a novel network architecture based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.'
  },
  {
    title: 'BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding',
    authors: ['Jacob Devlin', 'Ming-Wei Chang', 'Kenton Lee', 'Kristina Toutanova'],
    source: 'arXiv',
    url: 'https://arxiv.org/abs/1810.04805',
    description: 'BERT stands for Bidirectional Encoder Representations from Transformers. It is designed to pre-train deep bidirectional representations from unlabeled text by jointly conditioning on both left and right context in all layers.'
  },
  {
    title: 'Generative Adversarial Networks',
    authors: ['Ian J. Goodfellow', 'Jean Pouget-Abadie', 'Mehdi Mirza', 'Bing Xu', 'David Warde-Farley', 'Sherjil Ozair', 'Aaron Courville', 'Yoshua Bengio'],
    source: 'arXiv',
    url: 'https://arxiv.org/abs/1406.2661',
    description: 'A new framework for estimating generative models via an adversarial process, in which two models are trained simultaneously: a generative model G that captures the data distribution, and a discriminative model D that estimates the probability that a sample came from the training data rather than G.'
  },
  {
    title: 'Deep Residual Learning for Image Recognition',
    authors: ['Kaiming He', 'Xiangyu Zhang', 'Shaoqing Ren', 'Jian Sun'],
    source: 'IEEE/CVF Conference on Computer Vision and Pattern Recognition',
    url: 'https://www.cv-foundation.org/openaccess/content_cvpr_2016/html/He_Deep_Residual_Learning_CVPR_2016_paper.html',
    description: 'Presents a residual learning framework to ease the training of networks that are substantially deeper than those used previously. These residual networks are easier to optimize and can gain accuracy from considerably increased depth.'
  },
  {
    title: 'An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale',
    authors: ['Alexey Dosovitskiy', 'Lucas Beyer', 'Alexander Kolesnikov', 'Dirk Weissenborn', 'Xiaohua Zhai', 'Thomas Unterthiner', 'Mostafa Dehghani', 'Matthias Minderer', 'Georg Heigold', 'Sylvain Gelly', 'Jakob Uszkoreit', 'Neil Houlsby'],
    source: 'ICLR 2021',
    url: 'https://arxiv.org/abs/2010.11929',
    description: 'This paper shows that a pure transformer applied directly to sequences of image patches can perform very well on image classification tasks.'
  }
];

export const sampleDatasets: Dataset[] = [
  {
    name: 'The IMDb-WIKI dataset',
    source: 'Kaggle',
    url: 'https://www.kaggle.com/datasets/imdb-wiki-dataset/imdb-wiki-dataset',
    description: 'A large-scale dataset of face images with gender and age labels. It is one of the largest publicly available datasets of its kind.'
  },
  {
    name: 'The 20 Newsgroups dataset',
    source: 'Hugging Face',
    url: 'https://huggingface.co/datasets/newsgroup',
    description: 'A popular dataset for text classification and clustering. It comprises around 20,000 newsgroup documents, partitioned evenly across 20 different newsgroups.'
  },
  {
    name: 'CIFAR-10 and CIFAR-100',
    source: 'University of Toronto',
    url: 'https://www.cs.toronto.edu/~kriz/cifar.html',
    description: 'Two widely used datasets for machine learning research, consisting of 60,000 32x32 color images in 10 or 100 classes.'
  },
  {
    name: 'SQuAD: The Stanford Question Answering Dataset',
    source: 'Stanford University',
    url: 'https://rajpurkar.github.io/SQuAD-explorer/',
    description: 'A reading comprehension dataset, consisting of questions posed by crowdworkers on a set of Wikipedia articles, where the answer to every question is a segment of text, or span, from the corresponding reading passage.'
  },
  {
    name: 'COCO: Common Objects in Context',
    source: 'COCO Consortium',
    url: 'https://cocodataset.org/',
    description: 'A large-scale object detection, segmentation, and captioning dataset. COCO has several features: Object segmentation, Recognition in context, Superpixel stuff segmentation, 330K images (>200K labeled), 1.5 million object instances, 80 object categories, 91 stuff categories.'
  }
];
